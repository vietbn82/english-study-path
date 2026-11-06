using System.Text.Json;
using System.Text.RegularExpressions;
using DevEngCoach.Common;
using Microsoft.Extensions.Logging;

namespace DevEngCoach.Services;

public sealed class SpeechScoringService : ISpeechScoringService
{
    private readonly ISrsService srsService;
    private readonly ICurriculumService curriculumService;
    private readonly ILogger<SpeechScoringService> logger;
    private readonly string storagePath;
    private readonly object lockObj = new();
    private List<DrillScoreRecord> history = [];

    public SpeechScoringService(
        ISrsService srsService,
        ICurriculumService curriculumService,
        ILogger<SpeechScoringService> logger,
        string? storagePath = null)
    {
        this.srsService = srsService;
        this.curriculumService = curriculumService;
        this.logger = logger;
        this.storagePath = storagePath ?? Path.Combine(AppContext.BaseDirectory, "Data", "speech_scores.json");

        LoadData();
    }

    public Task<SpeechScoreResponse> ScoreSpeechAsync(SpeechScoreRequest request, CancellationToken ct = default)
    {
        var targetText = (request.TargetWordOrSentence ?? string.Empty).Trim();
        var spokenText = (request.SpokenText ?? string.Empty).Trim();
        var expectedPhonemes = (request.ExpectedPhonemes ?? string.Empty).Trim();

        var breakdown = new List<PhonemeResult>();

        // Analyze Ending Consonants
        EvaluateEndingConsonant(targetText, spokenText, expectedPhonemes, breakdown);

        // Analyze Dental Fricatives (/θ/, /ð/)
        EvaluateDentalFricatives(targetText, spokenText, expectedPhonemes, breakdown);

        // Analyze Palatal Fricatives/Affricates (/ʃ/, /tʃ/, /dʒ/)
        EvaluatePalatals(targetText, spokenText, expectedPhonemes, breakdown);

        // Analyze Consonant Clusters
        EvaluateConsonantClusters(targetText, spokenText, breakdown);

        // If no specific phonological target was identified, perform normalized token matching
        if (breakdown.Count == 0)
        {
            EvaluateGeneralTokens(targetText, spokenText, breakdown);
        }

        // Calculate Category and Overall Scores
        var totalItems = breakdown.Count;
        var correctItems = breakdown.Count(b => b.IsCorrect);
        var overallAccuracy = totalItems > 0
            ? (int)Math.Round((double)correctItems / totalItems * 100)
            : (string.Equals(targetText, spokenText, StringComparison.OrdinalIgnoreCase) ? 100 : 40);

        // Strict clamp
        overallAccuracy = Math.Clamp(overallAccuracy, 0, 100);

        var isPassing = overallAccuracy >= 75;
        var autoEnrolled = false;

        // Auto-enroll in SRS weak spots if under threshold (per spec: < 60%)
        if (overallAccuracy < 60 && !string.IsNullOrWhiteSpace(targetText))
        {
            try
            {
                var targetSound = expectedPhonemes;
                if (string.IsNullOrWhiteSpace(targetSound))
                {
                    var lesson = curriculumService.GetLessonByDay(request.DayNumber);
                    targetSound = lesson?.Phonetics.TargetSound ?? "/coda/";
                }

                srsService.AutoEnrollWeakSpot(new SrsEnrollRequest(targetText, targetSound, $"Pronunciation drill Day {request.DayNumber}", overallAccuracy));
                autoEnrolled = true;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to auto-enroll weak spot for '{TargetText}'", targetText);
            }
        }

        var feedback = GenerateFeedbackSummary(overallAccuracy, breakdown);

        // Record history
        var categoryScores = ComputeCategoryScores(breakdown);
        var record = new DrillScoreRecord(
            SessionId: Guid.NewGuid().ToString("N"),
            Timestamp: DateTime.UtcNow,
            DayNumber: request.DayNumber,
            TargetText: targetText,
            OverallAccuracy: overallAccuracy,
            CategoryScores: categoryScores
        );

        lock (lockObj)
        {
            history.Add(record);
            SaveData();
        }

        return Task.FromResult(new SpeechScoreResponse(
            OverallAccuracy: overallAccuracy,
            IsPassing: isPassing,
            PhonemeBreakdown: breakdown,
            AutoEnrolledInSrs: autoEnrolled,
            FeedbackSummary: feedback
        ));
    }

    public Task<SpeechSummaryResponse> GetSummaryAsync(CancellationToken ct = default)
    {
        lock (lockObj)
        {
            if (history.Count == 0)
            {
                return Task.FromResult(new SpeechSummaryResponse(
                    TotalDrillsRecorded: 0,
                    AverageAccuracy: 0,
                    CategoryPerformance: [],
                    CurrentWeakSpots: []
                ));
            }

            var avgAccuracy = (int)Math.Round(history.Average(h => h.OverallAccuracy));
            var allCats = history.SelectMany(h => h.CategoryScores).ToList();
            var groupedCats = allCats
                .GroupBy(c => c.Category)
                .Select(g => new CategoryScore(
                    Category: g.Key,
                    TotalCount: g.Sum(x => x.TotalCount),
                    CorrectCount: g.Sum(x => x.CorrectCount),
                    AccuracyPercentage: g.Sum(x => x.TotalCount) > 0
                        ? (int)Math.Round((double)g.Sum(x => x.CorrectCount) / g.Sum(x => x.TotalCount) * 100)
                        : 0
                ))
                .ToList();

            var weakSpots = history
                .Where(h => h.OverallAccuracy < 60)
                .Select(h => h.TargetText)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(10)
                .ToList();

            return Task.FromResult(new SpeechSummaryResponse(
                TotalDrillsRecorded: history.Count,
                AverageAccuracy: avgAccuracy,
                CategoryPerformance: groupedCats,
                CurrentWeakSpots: weakSpots
            ));
        }
    }

    public Task<IReadOnlyList<DrillScoreRecord>> GetHistoryAsync(int limit = 50, CancellationToken ct = default)
    {
        lock (lockObj)
        {
            var list = history
                .OrderByDescending(h => h.Timestamp)
                .Take(limit)
                .ToList();
            return Task.FromResult<IReadOnlyList<DrillScoreRecord>>(list);
        }
    }

    public int RestoreScores(IEnumerable<DrillScoreRecord> scores)
    {
        ArgumentNullException.ThrowIfNull(scores);
        lock (lockObj)
        {
            history = scores.ToList();
            SaveData();
            return history.Count;
        }
    }

    private static void EvaluateEndingConsonant(string target, string spoken, string expectedPhonemes, List<PhonemeResult> breakdown)
    {
        var endingTargets = new[] { "/t/", "/d/", "/s/", "/z/", "/k/", "/p/" };
        var hasEndingTarget = endingTargets.Any(t => expectedPhonemes.Contains(t, StringComparison.OrdinalIgnoreCase))
            || target.EndsWith('t') || target.EndsWith('d') || target.EndsWith('s') || target.EndsWith('z')
            || target.EndsWith("ed", StringComparison.OrdinalIgnoreCase);

        if (!hasEndingTarget) return;

        var targetLower = target.ToLowerInvariant();
        var spokenLower = spoken.ToLowerInvariant();

        // Check if spoken word dropped the ending letter
        var lastChar = targetLower[^1];
        if (targetLower.EndsWith("ed") && (lastChar == 'd' || lastChar == 't'))
        {
            var droppedEd = !spokenLower.EndsWith('d') && !spokenLower.EndsWith('t') && !spokenLower.EndsWith("ed");
            breakdown.Add(new PhonemeResult(
                TargetPhoneme: "-ed (/t/ or /d/)",
                DetectedPhoneme: droppedEd ? "[omitted / dropped]" : "-ed pronounced",
                IsCorrect: !droppedEd,
                Category: PhonemeCategory.EndingConsonant,
                KinestheticCorrectionTip: "Nén khí và giật lưỡi dứt khoát tại ngạc cứng để nhả âm đuôi /t/ hoặc /d/."
            ));
            return;
        }

        var isDropped = spokenLower.Length == 0 || (spokenLower.Length < targetLower.Length && !spokenLower.EndsWith(lastChar));
        var targetPhonemeDisplay = lastChar switch
        {
            't' => "/t/",
            'd' => "/d/",
            's' => "/s/",
            'z' => "/z/",
            'k' => "/k/",
            _ => $"/{lastChar}/"
        };

        breakdown.Add(new PhonemeResult(
            TargetPhoneme: targetPhonemeDisplay,
            DetectedPhoneme: isDropped ? "[omitted / dropped]" : targetPhonemeDisplay,
            IsCorrect: !isDropped,
            Category: PhonemeCategory.EndingConsonant,
            KinestheticCorrectionTip: $"Âm đuôi {targetPhonemeDisplay}: Giữ luồng hơi, chạm đúng điểm ngạc và nhả dứt khoát không ngậm miệng lại."
        ));
    }

    private static void EvaluateDentalFricatives(string target, string spoken, string expectedPhonemes, List<PhonemeResult> breakdown)
    {
        if (!expectedPhonemes.Contains("/θ/") && !expectedPhonemes.Contains("/ð/") && !target.Contains("th", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var targetSymbol = expectedPhonemes.Contains("/ð/") ? "/ð/" : "/θ/";
        var spokenLower = spoken.ToLowerInvariant();

        // Vietnamese interference: substituting "th" with "t" or "s" or dropping it
        var isMissubstituted = spokenLower.Contains("tot") || spokenLower.Contains("tot ") || spokenLower.StartsWith("t ")
            || (spokenLower.Length > 0 && !spokenLower.Contains("th") && (spokenLower.Contains('t') || spokenLower.Contains('s')));

        breakdown.Add(new PhonemeResult(
            TargetPhoneme: targetSymbol,
            DetectedPhoneme: isMissubstituted ? "/t/ hoặc /s/ (bị trượt âm)" : targetSymbol,
            IsCorrect: !isMissubstituted,
            Category: PhonemeCategory.DentalFricative,
            KinestheticCorrectionTip: $"Đưa đầu lưỡi ra giữa 2 hàm răng 2-3mm, kẹp nhẹ và đẩy luồng hơi rít qua khe răng cho {targetSymbol}."
        ));
    }

    private static void EvaluatePalatals(string target, string spoken, string expectedPhonemes, List<PhonemeResult> breakdown)
    {
        var palatalSymbols = new[] { "/ʃ/", "/tʃ/", "/dʒ/" };
        var match = palatalSymbols.FirstOrDefault(s => expectedPhonemes.Contains(s, StringComparison.OrdinalIgnoreCase))
            ?? (target.Contains("sh", StringComparison.OrdinalIgnoreCase) ? "/ʃ/" :
                target.Contains("ch", StringComparison.OrdinalIgnoreCase) ? "/tʃ/" :
                target.Contains("ge", StringComparison.OrdinalIgnoreCase) ? "/dʒ/" : null);

        if (match is null) return;

        var spokenLower = spoken.ToLowerInvariant();
        var flattened = spokenLower.EndsWith('s') || spokenLower.EndsWith('z') || spokenLower.Contains(" s ");

        breakdown.Add(new PhonemeResult(
            TargetPhoneme: match,
            DetectedPhoneme: flattened ? "/s/ (bẹt môi)" : match,
            IsCorrect: !flattened,
            Category: PhonemeCategory.PalatalAffricate,
            KinestheticCorrectionTip: $"Chu tròn môi về phía trước như huýt sáo, hai bên mép thân lưỡi áp chặt răng hàm trên cho {match}."
        ));
    }

    private static void EvaluateConsonantClusters(string target, string spoken, List<PhonemeResult> breakdown)
    {
        var clusters = new[] { "scr", "str", "spr", "kts", "kst", "lks", "pts" };
        var targetLower = target.ToLowerInvariant();
        var spokenLower = spoken.ToLowerInvariant();

        var foundCluster = clusters.FirstOrDefault(c => targetLower.Contains(c));
        if (foundCluster is null) return;

        var omitted = !spokenLower.Contains(foundCluster);
        breakdown.Add(new PhonemeResult(
            TargetPhoneme: $"Cluster /{foundCluster}/",
            DetectedPhoneme: omitted ? "[cluster broken / vowel inserted]" : $"/{foundCluster}/",
            IsCorrect: !omitted,
            Category: PhonemeCategory.ConsonantCluster,
            KinestheticCorrectionTip: $"Nối liền cụm phụ âm {foundCluster} dứt khoát, tuyệt đối không chèn âm nguyên âm /ə/ vào giữa."
        ));
    }

    private static void EvaluateGeneralTokens(string target, string spoken, List<PhonemeResult> breakdown)
    {
        var targetWords = Regex.Split(target.ToLowerInvariant(), @"\W+").Where(w => w.Length > 0).ToList();
        var spokenWords = Regex.Split(spoken.ToLowerInvariant(), @"\W+").Where(w => w.Length > 0).ToHashSet();

        foreach (var word in targetWords)
        {
            var matched = spokenWords.Contains(word);
            breakdown.Add(new PhonemeResult(
                TargetPhoneme: word,
                DetectedPhoneme: matched ? word : "[mispronounced / missed]",
                IsCorrect: matched,
                Category: PhonemeCategory.Vowel,
                KinestheticCorrectionTip: matched ? "Phát âm rõ ràng" : $"Tập trung phát âm tròn vành rõ chữ cho từ '{word}'."
            ));
        }
    }

    private static List<CategoryScore> ComputeCategoryScores(IReadOnlyList<PhonemeResult> breakdown)
    {
        return breakdown
            .GroupBy(b => b.Category)
            .Select(g => new CategoryScore(
                Category: g.Key,
                TotalCount: g.Count(),
                CorrectCount: g.Count(x => x.IsCorrect),
                AccuracyPercentage: g.Count() > 0 ? (int)Math.Round((double)g.Count(x => x.IsCorrect) / g.Count() * 100) : 0
            ))
            .ToList();
    }

    private static string GenerateFeedbackSummary(int overallAccuracy, IReadOnlyList<PhonemeResult> breakdown)
    {
        var incorrect = breakdown.Where(b => !b.IsCorrect).ToList();
        if (incorrect.Count == 0 && overallAccuracy >= 80)
        {
            return "Xuất sắc! Âm đuôi và cơ học khẩu hình chuẩn xác, đáp ứng tiêu chuẩn giao tiếp kỹ thuật.";
        }

        var alerts = string.Join("; ", incorrect.Select(i => $"{i.TargetPhoneme}: {i.KinestheticCorrectionTip}"));
        return $"Điểm chuẩn hóa: {overallAccuracy}/100. Lưu ý sửa lỗi cơ học: {alerts}";
    }

    private void LoadData()
    {
        try
        {
            if (!File.Exists(storagePath)) return;
            var json = File.ReadAllText(storagePath);
            history = JsonSerializer.Deserialize<List<DrillScoreRecord>>(json) ?? [];
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to load speech scores from '{Path}'", storagePath);
            history = [];
        }
    }

    private void SaveData()
    {
        try
        {
            var dir = Path.GetDirectoryName(storagePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            var json = JsonSerializer.Serialize(history, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(storagePath, json);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save speech scores to '{Path}'", storagePath);
        }
    }
}
