using System.Text.Json;
using DevEngCoach.Common;

namespace DevEngCoach.Services;

public sealed class ProgressService : IProgressService
{
    private static readonly string[] CoreBlocks = ["Phonetics", "Frames", "Output"];

    private readonly string _filePath;
    private readonly ISrsService? _srsService;
    private static readonly object _lock = new();
    private ProgressFileModel _state;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public ProgressService(IWebHostEnvironment env, ISrsService? srsService = null)
    {
        _srsService = srsService;
        _filePath = Path.Combine(env.ContentRootPath, "Data", "progress.json");
        lock (_lock)
        {
            if (File.Exists(_filePath))
            {
                var content = File.ReadAllText(_filePath);
                _state = JsonSerializer.Deserialize<ProgressFileModel>(content, _jsonOptions)
                         ?? CreateDefaultState();
            }
            else
            {
                _state = CreateDefaultState();
                SaveStateInternal();
            }
        }
    }

    public ProgressSummary GetProgress() => GetSummary();

    public SessionLog CompleteDay(int dayNumber, int actualMinutes = 15) =>
        CompleteSession(new CompleteSessionRequest(dayNumber, actualMinutes, 5, null, null));

    public SessionLog MicroCompleteSession(int dayNumber, string blockName, int durationMinutes = 10) =>
        MicroCompleteSession(new MicroSessionRequest(dayNumber, blockName, durationMinutes));

    public ProgressSummary GetSummary()
    {
        lock (_lock)
        {
            var completedSessions = _state.Sessions
                .Where(s => ((s.Status == "Completed" || s.Status == "CompletedPartial") || s.Status == "CompletedPartial") && s.CompletedAt.HasValue)
                .OrderBy(s => s.DayNumber)
                .ToList();

            var totalCompleted = completedSessions.Count;
            var totalActualMinutes = completedSessions.Sum(s => s.ActualMinutes);
            var totalPlannedMinutes = totalCompleted * 30;
            var varianceMinutes = totalActualMinutes - totalPlannedMinutes;

            var currentStreak = CalculateCurrentStreak(completedSessions);
            var longestStreak = CalculateLongestStreak(completedSessions);

            var nextDay = 1;
            while (nextDay <= 90 && _state.Sessions.Any(s => s.DayNumber == nextDay && (s.Status == "Completed" || s.Status == "CompletedPartial")))
            {
                nextDay++;
            }

            var completionPercentage = Math.Round((double)totalCompleted / 90 * 100, 1);

            return new ProgressSummary(
                CurrentStreakDays: currentStreak,
                LongestStreakDays: longestStreak,
                TotalCompletedDays: totalCompleted,
                TotalPlannedDays: 90,
                TotalActualMinutesSpent: totalActualMinutes,
                TotalPlannedMinutesExpected: totalPlannedMinutes,
                VarianceMinutes: varianceMinutes,
                CompletionPercentage: completionPercentage,
                NextDayNumber: Math.Min(nextDay, 90)
            );
        }
    }

    public IReadOnlyList<SessionLog> GetAllSessions()
    {
        lock (_lock)
        {
            return _state.Sessions.ToList();
        }
    }

    public SessionLog? GetSessionByDay(int dayNumber)
    {
        lock (_lock)
        {
            return _state.Sessions.FirstOrDefault(s => s.DayNumber == dayNumber);
        }
    }

    public SessionLog CompleteSession(CompleteSessionRequest request)
    {
        lock (_lock)
        {
            var existingIndex = _state.Sessions.FindIndex(s => s.DayNumber == request.DayNumber);
            var now = DateTime.Now;
            var sessionMode = string.IsNullOrWhiteSpace(request.SessionMode) ? "Visual" : request.SessionMode.Trim();
            var isAudioOnly = string.Equals(sessionMode, "AudioOnly", StringComparison.OrdinalIgnoreCase);

            var log = new SessionLog(
                DayNumber: request.DayNumber,
                ScheduledDate: existingIndex >= 0 ? _state.Sessions[existingIndex].ScheduledDate : now.Date.AddHours(22),
                CompletedAt: now,
                PlannedMinutes: 30,
                ActualMinutes: Math.Max(1, request.ActualMinutes),
                Status: "Completed",
                SelfRating: request.SelfRating ?? 5,
                LearnerNotes: request.LearnerNotes,
                AiFeedbackSnippet: request.AiFeedbackSnippet,
                SessionMode: sessionMode,
                CompletedBlock: isAudioOnly ? "AudioOnly" : null,
                BlocksCompleted: ["Phonetics", "Frames", "Output"],
                CompletionMode: isAudioOnly ? "AudioOnly" : "Manual"
            );

            if (existingIndex >= 0)
            {
                _state.Sessions[existingIndex] = log;
            }
            else
            {
                _state.Sessions.Add(log);
            }

            SaveStateInternal();
            return log;
        }
    }

    public SessionLog MicroCompleteSession(MicroSessionRequest request)
    {
        lock (_lock)
        {
            var existingIndex = _state.Sessions.FindIndex(s => s.DayNumber == request.DayNumber);
            var existing = existingIndex >= 0 ? _state.Sessions[existingIndex] : null;
            var now = DateTime.Now;
            var blockName = string.IsNullOrWhiteSpace(request.SelectedBlock) ? "Phonetics" : request.SelectedBlock.Trim();

            var blocks = new List<string>();
            if (existing?.BlocksCompleted is { Count: > 0 })
            {
                foreach (var b in existing.BlocksCompleted)
                {
                    if (!string.IsNullOrWhiteSpace(b) && !blocks.Contains(b.Trim(), StringComparer.OrdinalIgnoreCase))
                    {
                        blocks.Add(b.Trim());
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(existing?.CompletedBlock) &&
                !blocks.Contains(existing.CompletedBlock.Trim(), StringComparer.OrdinalIgnoreCase))
            {
                blocks.Add(existing.CompletedBlock.Trim());
            }

            if (!blocks.Contains(blockName, StringComparer.OrdinalIgnoreCase))
            {
                blocks.Add(blockName);
            }

            var allThreeCompleted = CoreBlocks.All(cb => blocks.Contains(cb, StringComparer.OrdinalIgnoreCase));
            var isUpgraded = allThreeCompleted || string.Equals(existing?.Status, "Completed", StringComparison.OrdinalIgnoreCase);

            var status = isUpgraded ? "Completed" : "CompletedPartial";
            var completionMode = isUpgraded ? "MicroUpgraded" : "Partial";
            var completedBlock = isUpgraded ? null : blockName;
            var accumulatedMinutes = (existing?.ActualMinutes ?? 0) + Math.Max(1, request.ActualMinutes);
            var plannedMinutes = isUpgraded ? 30 : 10;

            var log = new SessionLog(
                DayNumber: request.DayNumber,
                ScheduledDate: existing is not null ? existing.ScheduledDate : now.Date.AddHours(22),
                CompletedAt: now,
                PlannedMinutes: plannedMinutes,
                ActualMinutes: accumulatedMinutes,
                Status: status,
                SelfRating: request.SelfRating ?? existing?.SelfRating ?? (isUpgraded ? 5 : 4),
                LearnerNotes: request.LearnerNotes ?? (isUpgraded
                    ? $"Full session upgraded via Micro-sessions ({string.Join(", ", blocks)})"
                    : $"Micro-session: {blockName} block completed"),
                AiFeedbackSnippet: isUpgraded
                    ? "All 3 blocks completed! Upgraded to full session completion."
                    : $"Completed 10-minute escape hatch ({blockName}). Streak maintained!",
                SessionMode: existing?.SessionMode ?? "Visual",
                CompletedBlock: completedBlock,
                BlocksCompleted: blocks,
                CompletionMode: completionMode
            );

            if (existingIndex >= 0)
            {
                _state.Sessions[existingIndex] = log;
            }
            else
            {
                _state.Sessions.Add(log);
            }

            SaveStateInternal();
            return log;
        }
    }

    public BlockRecommendation GetRecommendation()
    {
        lock (_lock)
        {
            var orderedSessions = _state.Sessions
                .Where(s => string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(s.Status, "CompletedPartial", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(s => s.DayNumber)
                .ThenByDescending(s => s.CompletedAt)
                .ToList();

            var consecutivePartials = 0;
            foreach (var s in orderedSessions)
            {
                if (string.Equals(s.Status, "CompletedPartial", StringComparison.OrdinalIgnoreCase))
                {
                    consecutivePartials++;
                }
                else if (string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                {
                    break;
                }
            }

            var showNudge = consecutivePartials >= 5;

            var daysSinceSpeaking = 0;
            foreach (var s in orderedSessions)
            {
                var hadOutput = string.Equals(s.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(s.CompletedBlock, "Output", StringComparison.OrdinalIgnoreCase) ||
                                (s.BlocksCompleted?.Contains("Output", StringComparer.OrdinalIgnoreCase) ?? false) ||
                                (s.LearnerNotes?.Contains("Output", StringComparison.OrdinalIgnoreCase) ?? false);
                if (hadOutput)
                {
                    break;
                }
                daysSinceSpeaking++;
            }

            var weakSpotsCount = 0;
            try
            {
                weakSpotsCount = _srsService?.GetDueItems()?.Count ?? 0;
            }
            catch
            {
                weakSpotsCount = 0;
            }

            string recommended;
            string reason;
            int priorityWeight;

            var lastSession = orderedSessions.FirstOrDefault();
            var lastWasPartial = lastSession is not null &&
                                 string.Equals(lastSession.Status, "CompletedPartial", StringComparison.OrdinalIgnoreCase);
            var lastHadPhonetics = lastWasPartial &&
                                   (string.Equals(lastSession!.CompletedBlock, "Phonetics", StringComparison.OrdinalIgnoreCase) ||
                                    (lastSession.BlocksCompleted?.Contains("Phonetics", StringComparer.OrdinalIgnoreCase) ?? false) ||
                                    (lastSession.LearnerNotes?.Contains("Phonetics", StringComparison.OrdinalIgnoreCase) ?? false));
            var lastHadFrames = lastWasPartial &&
                                (string.Equals(lastSession!.CompletedBlock, "Frames", StringComparison.OrdinalIgnoreCase) ||
                                 (lastSession.BlocksCompleted?.Contains("Frames", StringComparer.OrdinalIgnoreCase) ?? false) ||
                                 (lastSession.LearnerNotes?.Contains("Frames", StringComparison.OrdinalIgnoreCase) ?? false));

            if (weakSpotsCount >= 5)
            {
                recommended = "Phonetics";
                reason = $"Có {weakSpotsCount} từ yếu (weak spots) đến hạn ôn tập SRS — ưu tiên 10 phút Phonetics để sửa cơ học khẩu hình.";
                priorityWeight = 1;
            }
            else if (daysSinceSpeaking >= 2)
            {
                recommended = "Output";
                reason = $"Đã {daysSinceSpeaking} ngày chưa luyện nói (Speaking Output) — ưu tiên 10 phút Output để duy trì phản xạ Standup.";
                priorityWeight = 3;
            }
            else if (lastHadFrames)
            {
                recommended = "Output";
                reason = "Tập trung luyện nói dứt khoát 1 câu Standup hoàn chỉnh (Output) tiếp nối phiên Frames.";
                priorityWeight = 3;
            }
            else if (lastHadPhonetics)
            {
                recommended = "Frames";
                reason = "Củng cố các khung câu kỹ thuật (Frames) trước khi luyện phản xạ.";
                priorityWeight = 2;
            }
            else
            {
                recommended = "Phonetics";
                reason = "Bắt đầu ngày học với 10 phút khởi động cơ học khẩu hình.";
                priorityWeight = 1;
            }

            return new BlockRecommendation(
                RecommendedBlock: recommended,
                ReasonVi: reason,
                PriorityWeight: priorityWeight,
                WeakSpotCount: weakSpotsCount,
                DaysSinceLastSpeaking: daysSinceSpeaking,
                ShowConsecutivePartialNudge: showNudge,
                EstimatedMinutes: 5
            );
        }
    }

    public void ResetProgress()
    {
        lock (_lock)
        {
            _state = CreateDefaultState();
            SaveStateInternal();
        }
    }

    public int RestoreSessions(IEnumerable<SessionLog> sessions)
    {
        ArgumentNullException.ThrowIfNull(sessions);
        lock (_lock)
        {
            _state.Sessions = sessions.ToList();
            SaveStateInternal();
            return _state.Sessions.Count;
        }
    }

    private void SaveStateInternal()
    {
        var json = JsonSerializer.Serialize(_state, _jsonOptions);
        File.WriteAllText(_filePath, json);
    }

    private static ProgressFileModel CreateDefaultState() => new()
    {
        TargetTime = "22:00",
        DailyPlannedMinutes = 30,
        StartDate = DateTime.Now.ToString("yyyy-MM-dd"),
        Sessions = new List<SessionLog>()
    };

    private static int CalculateCurrentStreak(List<SessionLog> completedSessions)
    {
        if (completedSessions.Count == 0) return 0;

        var dates = completedSessions
            .Where(s => s.CompletedAt.HasValue)
            .Select(s => s.CompletedAt!.Value.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        if (dates.Count == 0) return 0;

        var today = DateTime.Today;
        if (dates[0] != today && dates[0] != today.AddDays(-1))
        {
            return 0; // Streak broken if not done today or yesterday
        }

        var streak = 1;
        for (var i = 1; i < dates.Count; i++)
        {
            if (dates[i - 1].AddDays(-1) == dates[i])
            {
                streak++;
            }
            else
            {
                break;
            }
        }
        return streak;
    }

    private static int CalculateLongestStreak(List<SessionLog> completedSessions)
    {
        if (completedSessions.Count == 0) return 0;

        var dates = completedSessions
            .Where(s => s.CompletedAt.HasValue)
            .Select(s => s.CompletedAt!.Value.Date)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        if (dates.Count == 0) return 0;

        var maxStreak = 1;
        var current = 1;

        for (var i = 1; i < dates.Count; i++)
        {
            if (dates[i - 1].AddDays(1) == dates[i])
            {
                current++;
                if (current > maxStreak) maxStreak = current;
            }
            else
            {
                current = 1;
            }
        }
        return maxStreak;
    }
}

public sealed class ProgressFileModel
{
    public string TargetTime { get; set; } = "22:00";
    public int DailyPlannedMinutes { get; set; } = 30;
    public string StartDate { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public List<SessionLog> Sessions { get; set; } = new();
}
