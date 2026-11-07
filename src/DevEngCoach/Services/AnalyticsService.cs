using System.Globalization;
using System.Text.Json;
using DevEngCoach.Common;
using Microsoft.Extensions.Logging;

namespace DevEngCoach.Services;

public sealed class AnalyticsService : IAnalyticsService
{
    private readonly IProgressService progressService;
    private readonly ICurriculumService curriculumService;
    private readonly ILogger<AnalyticsService> logger;
    private readonly string badgesStoragePath;
    private readonly object lockObj = new();
    private HashSet<string> unlockedBadgeIds = [];

    private static readonly IReadOnlyList<StreakBadge> BadgeCatalog =
    [
        new("badge_7d", "7-Day Ignition", "🔥", 7, false, null, "Hoàn thành 7 ngày luyện cơ học phát âm liên tiếp."),
        new("badge_30d", "Sprint 1 Finisher", "⭐", 30, false, null, "Làm chủ âm đuôi & Báo cáo Daily Standup lưu loát."),
        new("badge_60d", "Sprint 2 Architecture", "💎", 60, false, null, "Làm chủ Connected Speech & Trình bày Sprint Demo."),
        new("badge_90d", "Full Tech Mastery", "👑", 90, false, null, "Hoàn thành 90 ngày: Tranh biện kiến trúc và đàm phán 1-on-1.")
    ];

    public AnalyticsService(
        IProgressService progressService,
        ICurriculumService curriculumService,
        ILogger<AnalyticsService> logger,
        string? badgesStoragePath = null)
    {
        this.progressService = progressService;
        this.curriculumService = curriculumService;
        this.logger = logger;
        this.badgesStoragePath = badgesStoragePath ?? Path.Combine(AppContext.BaseDirectory, "Data", "unlocked_badges.json");

        LoadBadges();
    }

    private static bool IsCompletedOrPartial(SessionLog s) =>
        string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(s.Status, "CompletedPartial", StringComparison.OrdinalIgnoreCase);

    public Task<BurndownData> GetBurndownDataAsync(CancellationToken ct = default)
    {
        const int totalDays = 90;
        var sessions = progressService.GetAllSessions();

        var completedCount = sessions.Count(IsCompletedOrPartial);
        var elapsedDays = sessions.Count > 0 ? Math.Max(sessions.Max(s => s.DayNumber), 1) : 1;

        // Points for Days 1 to 90
        var points = new List<BurndownPoint>(totalDays);
        for (var day = 1; day <= totalDays; day++)
        {
            var ideal = Math.Max(0.0, totalDays - (day - 1));
            
            // Actual completed (including CompletedPartial) up to this day
            var completedUpToDay = sessions.Count(s => s.DayNumber <= day && IsCompletedOrPartial(s));
            var actualRemaining = day <= elapsedDays
                ? Math.Max(0.0, totalDays - completedUpToDay)
                : Math.Max(0.0, totalDays - completedCount);

            points.Add(new BurndownPoint(day, Math.Round(ideal, 1), Math.Round(actualRemaining, 1)));
        }

        var variance = completedCount - elapsedDays;
        var status = variance > 0
            ? $"{variance} ngày trước tiến độ lý tưởng (Ahead)"
            : variance < 0
                ? $"{Math.Abs(variance)} ngày chậm hơn tiến độ (Behind)"
                : "Đúng tiến độ chuẩn (On Pace)";

        return Task.FromResult(new BurndownData(
            Points: points,
            TotalDays: totalDays,
            CompletedDays: completedCount,
            ElapsedDays: elapsedDays,
            VarianceDays: variance,
            PaceStatus: status,
            SprintBoundaries: [30, 60, 90]
        ));
    }

    public Task<IReadOnlyList<HeatmapCell>> GetHeatmapGridAsync(CancellationToken ct = default)
    {
        var sessions = progressService.GetAllSessions().ToDictionary(s => s.DayNumber);
        var cells = new List<HeatmapCell>(90);

        var startDate = DateTime.UtcNow.Date.AddDays(-sessions.Count);

        for (var day = 1; day <= 90; day++)
        {
            var sprintId = day <= 30 ? 1 : day <= 60 ? 2 : 3;
            var dateIso = startDate.AddDays(day - 1).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

            if (sessions.TryGetValue(day, out var session))
            {
                var intensity = session.ActualMinutes switch
                {
                    >= 30 => 3,
                    >= 16 => 2,
                    >= 1 => 1,
                    _ => 0
                };

                cells.Add(new HeatmapCell(
                    DayNumber: day,
                    DateIso: session.CompletedAt?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? dateIso,
                    ActualMinutes: session.ActualMinutes,
                    IntensityLevel: intensity,
                    SelfRating: session.SelfRating ?? 0,
                    SprintId: sprintId,
                    Status: session.Status.ToString()
                ));
            }
            else
            {
                cells.Add(new HeatmapCell(
                    DayNumber: day,
                    DateIso: dateIso,
                    ActualMinutes: 0,
                    IntensityLevel: 0,
                    SelfRating: 0,
                    SprintId: sprintId,
                    Status: "Pending"
                ));
            }
        }

        return Task.FromResult<IReadOnlyList<HeatmapCell>>(cells);
    }

    public Task<IReadOnlyList<StreakBadge>> GetStreakBadgesAsync(CancellationToken ct = default)
    {
        var summary = progressService.GetSummary();
        var bestStreak = Math.Max(summary.CurrentStreakDays, Math.Max(summary.LongestStreakDays, summary.TotalCompletedDays));

        lock (lockObj)
        {
            var updated = false;
            var result = new List<StreakBadge>();

            foreach (var badge in BadgeCatalog)
            {
                var isUnlocked = unlockedBadgeIds.Contains(badge.BadgeId) || bestStreak >= badge.RequiredStreak;
                if (isUnlocked && !unlockedBadgeIds.Contains(badge.BadgeId))
                {
                    unlockedBadgeIds.Add(badge.BadgeId);
                    updated = true;
                }

                result.Add(badge with
                {
                    IsUnlocked = isUnlocked,
                    UnlockedAt = isUnlocked ? DateTime.UtcNow : null
                });
            }

            if (updated)
            {
                SaveBadges();
            }

            return Task.FromResult<IReadOnlyList<StreakBadge>>(result);
        }
    }

    public Task<IReadOnlyList<WeeklyVelocity>> GetWeeklyVelocityAsync(CancellationToken ct = default)
    {
        var sessions = progressService.GetAllSessions().ToList();
        var list = new List<WeeklyVelocity>();

        for (var week = 1; week <= 13; week++)
        {
            var startDay = (week - 1) * 7 + 1;
            var endDay = Math.Min(week * 7, 90);

            var weekSessions = sessions
                .Where(s => s.DayNumber >= startDay && s.DayNumber <= endDay && IsCompletedOrPartial(s))
                .ToList();

            var completed = weekSessions.Count;
            var totalMins = weekSessions.Sum(s => s.ActualMinutes);
            var avgMins = completed > 0 ? Math.Round((double)totalMins / completed, 1) : 0.0;
            var isCurrentWeek = sessions.Count >= startDay && sessions.Count <= endDay;

            list.Add(new WeeklyVelocity(
                WeekNumber: week,
                WeekLabel: $"Tuần {week} (Ngày {startDay}-{endDay})",
                SessionsCompleted: completed,
                TotalMinutes: totalMins,
                AverageMinutesPerSession: avgMins,
                IsCurrentWeek: isCurrentWeek
            ));
        }

        return Task.FromResult<IReadOnlyList<WeeklyVelocity>>(list);
    }

    public async Task<AnalyticsOverview> GetOverviewAsync(CancellationToken ct = default)
    {
        var burndown = await GetBurndownDataAsync(ct);
        var heatmap = await GetHeatmapGridAsync(ct);
        var badges = await GetStreakBadgesAsync(ct);
        var velocity = await GetWeeklyVelocityAsync(ct);
        var blockFrequency = ComputeBlockFrequency();
        var catchUp = await GetCatchUpPlanAsync(ct);

        return new AnalyticsOverview(burndown, heatmap, badges, velocity, blockFrequency, catchUp);
    }

    public Task<CatchUpPlan> GetCatchUpPlanAsync(CancellationToken ct = default)
    {
        var sessions = progressService.GetAllSessions();
        var completedSessions = sessions.Where(IsCompletedOrPartial).ToList();
        var completedCount = completedSessions.Count;
        var elapsedDays = sessions.Count > 0 ? Math.Max(sessions.Max(s => s.DayNumber), 1) : 1;
        var variance = completedCount - elapsedDays;
        var completedDaysSet = completedSessions.Select(s => s.DayNumber).ToHashSet();

        var missedDays = new List<int>();
        for (var d = 1; d <= elapsedDays; d++)
        {
            if (!completedDaysSet.Contains(d))
            {
                missedDays.Add(d);
            }
        }

        // If user is behind in variance but missedDays list is empty (e.g. only started Day 1), take next pending days up to gap
        if (missedDays.Count == 0 && variance < 0)
        {
            var deficit = Math.Min(90, Math.Abs(variance));
            for (var d = completedCount + 1; d <= Math.Min(90, completedCount + deficit); d++)
            {
                missedDays.Add(d);
            }
        }

        var isBehind = variance < 0 || missedDays.Count > 0;
        var daysBehind = Math.Max(missedDays.Count, Math.Max(0, -variance));

        var pacingStatus = variance > 0
            ? "Ahead"
            : variance == 0 && missedDays.Count == 0
                ? "OnPace"
                : daysBehind <= 3
                    ? "SlightlyBehind"
                    : "SeverelyBehind";

        var suggestedStrategy = daysBehind switch
        {
            <= 0 => "Maintenance",
            <= 3 => "MicroCatchup",
            <= 6 => "WeekendSprint",
            _ => "FastTrackAudio"
        };

        var catchUpItems = new List<CatchUpDayItem>();
        foreach (var dayNum in missedDays.OrderBy(d => d).Take(7))
        {
            var lesson = curriculumService.GetLessonByDay(dayNum);
            var sprintId = lesson?.SprintId ?? (dayNum <= 30 ? 1 : dayNum <= 60 ? 2 : 3);
            var title = lesson?.Title ?? $"Day {dayNum} Technical English";
            var phoneticTarget = lesson?.Phonetics?.PhoneticSymbol ?? "/coda/";

            var isCorePhoneme = phoneticTarget.Contains("/t/") || phoneticTarget.Contains("/d/") ||
                                phoneticTarget.Contains("/s/") || phoneticTarget.Contains("/z/") ||
                                phoneticTarget.Contains("/θ/") || phoneticTarget.Contains("/ð/");

            var recommendedMode = isCorePhoneme ? "Micro10m" : "AudioOnly";
            var focusReason = isCorePhoneme
                ? $"Âm cốt lõi {phoneticTarget}: Ưu tiên 10m Khẩu hình để không rụng âm đuôi"
                : "Khung câu Standup: Nghe nhắm mắt 10m để nạp mẫu câu phản xạ";

            catchUpItems.Add(new CatchUpDayItem(
                DayNumber: dayNum,
                SprintId: sprintId,
                Title: title,
                PhoneticTarget: phoneticTarget,
                EstimatedMinutes: 10,
                RecommendedMode: recommendedMode,
                FocusReason: focusReason
            ));
        }

        var coachAdvice = daysBehind switch
        {
            <= 0 => "🚀 Bạn đang bám rất sát hoặc vượt tiến độ lý tưởng! Hãy duy trì nhịp độ 15-30 phút mỗi ngày.",
            <= 2 => "⚡ Bạn chỉ chậm 1-2 ngày. Đừng học dồn 2 tiếng! Hãy áp dụng chiến lược 'Micro-Catchup': mỗi ngày học thêm 1 chặng 10m (tổng 20m), sau 2-3 ngày bạn sẽ tự động san bằng độ trễ.",
            <= 5 => "☕ Độ trễ 3-5 ngày là rất bình thường khi dự án vào đợt release. Chiến lược tối ưu: Chọn 'Weekend Sprint' (dành 45m sáng thứ Bảy xử lý 3 bài) hoặc chuyển sang 'Audio-Only' khi commute.",
            _ => "🎯 Đừng để tâm lý quá tải khiến bạn bỏ cuộc! Hãy áp dụng nguyên tắc 80/20: Chỉ hoàn thành 10 phút chặng Khẩu hình hoặc nghe Audio-Only cho các bài bị trễ để lấy lại đà học ngay hôm nay."
        };

        var plan = new CatchUpPlan(
            IsBehind: isBehind,
            DaysBehind: daysBehind,
            ElapsedDays: elapsedDays,
            CompletedDays: completedCount,
            PacingStatus: pacingStatus,
            SuggestedStrategy: suggestedStrategy,
            CatchUpDaysTarget: daysBehind,
            PrioritizedCatchUpDays: catchUpItems,
            SeniorCoachAdvice: coachAdvice
        );

        return Task.FromResult(plan);
    }

    private BlockFrequencySummary ComputeBlockFrequency()
    {
        var sessions = progressService.GetAllSessions();

        var phoneticsDays = sessions.Count(s =>
            string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(s.CompletedBlock, "Phonetics", StringComparison.OrdinalIgnoreCase) ||
            (s.BlocksCompleted?.Contains("Phonetics", StringComparer.OrdinalIgnoreCase) ?? false));

        var framesDays = sessions.Count(s =>
            string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(s.CompletedBlock, "Frames", StringComparison.OrdinalIgnoreCase) ||
            (s.BlocksCompleted?.Contains("Frames", StringComparer.OrdinalIgnoreCase) ?? false));

        var outputDays = sessions.Count(s =>
            string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(s.CompletedBlock, "Output", StringComparison.OrdinalIgnoreCase) ||
            (s.BlocksCompleted?.Contains("Output", StringComparer.OrdinalIgnoreCase) ?? false));

        var fullCount = sessions.Count(s => string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase));
        var partialCount = sessions.Count(s => string.Equals(s.Status, "CompletedPartial", StringComparison.OrdinalIgnoreCase));
        var audioOnlyCount = sessions.Count(s =>
            string.Equals(s.CompletedBlock, "AudioOnly", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(s.CompletionMode, "AudioOnly", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(s.SessionMode, "AudioOnly", StringComparison.OrdinalIgnoreCase));

        return new BlockFrequencySummary(
            PhoneticsDays: phoneticsDays,
            FramesDays: framesDays,
            OutputDays: outputDays,
            FullSessionsCount: fullCount,
            PartialSessionsCount: partialCount,
            AudioOnlySessionsCount: audioOnlyCount
        );
    }

    private void LoadBadges()
    {
        try
        {
            if (!File.Exists(badgesStoragePath)) return;
            var json = File.ReadAllText(badgesStoragePath);
            var loaded = JsonSerializer.Deserialize<List<string>>(json);
            if (loaded is not null)
            {
                unlockedBadgeIds = new HashSet<string>(loaded);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to load unlocked badges from '{Path}'", badgesStoragePath);
        }
    }

    private void SaveBadges()
    {
        try
        {
            var dir = Path.GetDirectoryName(badgesStoragePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            var json = JsonSerializer.Serialize(unlockedBadgeIds.ToList(), new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(badgesStoragePath, json);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save unlocked badges to '{Path}'", badgesStoragePath);
        }
    }
}
