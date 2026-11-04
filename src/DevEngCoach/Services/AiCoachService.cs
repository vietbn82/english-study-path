using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IAiCoachService
{
    Task<AiEvaluationResponse> EvaluateAsync(AiEvaluationRequest request, CancellationToken ct = default);
}

public sealed class AiCoachService(ICurriculumService curriculumService, ILogger<AiCoachService> logger) : IAiCoachService
{
    private static readonly string[] PossibleAgyPaths =
    [
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "agy", "bin", "agy.exe"),
        "agy.exe",
        "agy"
    ];

    public async Task<AiEvaluationResponse> EvaluateAsync(AiEvaluationRequest request, CancellationToken ct = default)
    {
        var lesson = curriculumService.GetLessonByDay(request.DayNumber);
        var targetSound = lesson?.Phonetics.TargetSound ?? "Ending consonants";
        var targetSymbol = lesson?.Phonetics.PhoneticSymbol ?? "/t/, /d/, /s/, /z/";
        var mechanicalTips = lesson?.Phonetics.MechanicalInstructions ?? "Check final consonants and voicing.";

        var agyPath = FindAgyExecutable();

        if (agyPath is not null)
        {
            try
            {
                var agyResult = await RunAgyEvaluationAsync(agyPath, request.InputText, targetSound, targetSymbol, mechanicalTips, ct);
                if (agyResult is not null)
                {
                    return agyResult;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AGY CLI execution failed or timed out. Falling back to built-in phonetic analysis engine.");
            }
        }

        // Built-in rule-based phonetic & grammar analyzer
        return GenerateHeuristicEvaluation(request.InputText, lesson);
    }

    private static string? FindAgyExecutable()
    {
        foreach (var path in PossibleAgyPaths)
        {
            if (File.Exists(path)) return path;
        }
        return null;
    }

    private async Task<AiEvaluationResponse?> RunAgyEvaluationAsync(
        string agyPath,
        string inputText,
        string targetSound,
        string targetSymbol,
        string mechanicalTips,
        CancellationToken ct)
    {
        var prompt = $$"""
You are an expert English Pronunciation & Presentation Coach for Vietnamese Software Engineers.
Analyze this learner input for Day Target: {{targetSound}} ({{targetSymbol}}).
Mechanical instruction: {{mechanicalTips}}
Learner text: "{{inputText}}"

Return ONLY a JSON object (no markdown, no backticks) with keys:
{
  "grammarCorrections": "Clear explanation of grammar fixes",
  "phoneticMechanicsAlerts": ["Alert on missing final codas or mouth positions", "Alert on stress-timing"],
  "seniorDevRefactoring": "How a Senior Staff Engineer would say this naturally in a meeting",
  "naturalSpeakingTip": "One kinesthetic mouth/breathing tip",
  "fluencyScore": 85
}
""";

        using var process = new Process();
        process.StartInfo = new ProcessStartInfo
        {
            FileName = agyPath,
            Arguments = $"--print \"{prompt.Replace("\"", "\\\"")}\" --effort low",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        process.Start();

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(12));

        var outputTask = process.StandardOutput.ReadToEndAsync(cts.Token);
        var errorTask = process.StandardError.ReadToEndAsync(cts.Token);

        await process.WaitForExitAsync(cts.Token);
        var output = await outputTask;

        if (string.IsNullOrWhiteSpace(output)) return null;

        // Extract JSON block if wrapped
        var jsonMatch = Regex.Match(output, @"\{[\s\S]*\}");
        if (!jsonMatch.Success) return null;

        using var doc = JsonDocument.Parse(jsonMatch.Value);
        var root = doc.RootElement;

        var grammar = root.TryGetProperty("grammarCorrections", out var g) ? g.GetString() ?? "" : "";
        var refactoring = root.TryGetProperty("seniorDevRefactoring", out var r) ? r.GetString() ?? "" : "";
        var tip = root.TryGetProperty("naturalSpeakingTip", out var t) ? t.GetString() ?? "" : "";
        var score = root.TryGetProperty("fluencyScore", out var s) && s.TryGetInt32(out var sc) ? sc : 80;

        var alerts = new List<string>();
        if (root.TryGetProperty("phoneticMechanicsAlerts", out var a) && a.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in a.EnumerateArray())
            {
                if (item.GetString() is { } str) alerts.Add(str);
            }
        }

        return new AiEvaluationResponse(
            Success: true,
            OriginalText: inputText,
            GrammarCorrections: grammar,
            PhoneticMechanicsAlerts: alerts,
            SeniorDevRefactoring: refactoring,
            NaturalSpeakingTip: tip,
            FluencyScore: Math.Clamp(score, 50, 100)
        );
    }

    private static AiEvaluationResponse GenerateHeuristicEvaluation(string inputText, Lesson? lesson)
    {
        var alerts = new List<string>();
        var corrections = new List<string>();
        var textLower = inputText.ToLowerInvariant();

        // 1. Check for common unreleased coda / past tense issues
        if (textLower.Contains("yesterday") && (textLower.Contains(" i work ") || textLower.Contains(" i test ") || textLower.Contains(" i fix ")))
        {
            corrections.Add("Chia thì quá khứ cho hành động đã hoàn tất hôm qua: 'worked' thay vì 'work', 'tested' thay vì 'test', 'fixed' thay vì 'fix'.");
            alerts.Add("Cơ học âm đuôi -ed: 'worked' -> /wɜːrkt/ (bật âm /t/ dứt khoát), 'fixed' -> /fɪkst/ (chặn /k/ rồi xì /s/ và bật /t/).");
        }

        // 2. Check for missing articles or awkward prepositions
        if (textLower.Contains("in develop branch") || textLower.Contains("to develop branch"))
        {
            corrections.Add("Thiếu mạo từ 'the': Nên dùng 'the develop branch' hoặc 'the feature branch'.");
        }

        if (textLower.Contains("wait user") || textLower.Contains("wait response"))
        {
            corrections.Add("Động từ 'wait' cần giới từ 'for': 'wait for the user response'.");
        }

        // 3. Lesson-specific mechanical cues
        if (lesson is not null)
        {
            alerts.Add($"Trọng tâm ngày hôm nay [{lesson.Phonetics.TargetSound}]: {lesson.Phonetics.MechanicalInstructions}");
            alerts.Add($"Lưu ý lỗi phổ biến người Việt: {lesson.Phonetics.CommonVietnameseMistake}");
        }

        if (corrections.Count == 0)
        {
            corrections.Add("Cấu trúc câu cơ bản đã chuẩn logic. Hãy chú ý ngắt nhịp và nói liền mạch.");
        }

        var refactored = PolishSentence(inputText);

        return new AiEvaluationResponse(
            Success: true,
            OriginalText: inputText,
            GrammarCorrections: string.Join(" ", corrections),
            PhoneticMechanicsAlerts: alerts,
            SeniorDevRefactoring: refactored,
            NaturalSpeakingTip: "Thở ra đều đặn khi kết câu, hạ cao độ giọng (downward pitch) ở từ cuối cùng để tạo sự tự tin của Senior Engineer.",
            FluencyScore: Math.Min(95, 75 + (inputText.Length > 20 ? 10 : 0))
        );
    }

    private static string PolishSentence(string input)
    {
        var cleaned = input.Trim();
        if (cleaned.StartsWith("yesterday i work", StringComparison.OrdinalIgnoreCase))
        {
            return cleaned.Replace("yesterday i work", "Yesterday, I worked", StringComparison.OrdinalIgnoreCase);
        }
        if (cleaned.StartsWith("today i will do", StringComparison.OrdinalIgnoreCase))
        {
            return cleaned.Replace("today i will do", "Today, my main priority is to deliver", StringComparison.OrdinalIgnoreCase);
        }
        return $"In our daily sync, I would phrase this as: \"{cleaned}\"";
    }
}
