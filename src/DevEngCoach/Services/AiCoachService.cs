using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IAiCoachService
{
    Task<AiEvaluationResponse> EvaluateAsync(AiEvaluationRequest request, CancellationToken ct = default);
    Task<StandupSimulationResponse> SimulateStandupAsync(StandupSimulationRequest request, CancellationToken ct = default);
    Task<DemoSimulationResponse> SimulateDemoAsync(DemoSimulationRequest request, CancellationToken ct = default);
    Task<PingPongSimulationResponse> SimulatePingPongAsync(PingPongSimulationRequest request, CancellationToken ct = default);
    Task<QuickLookupResponse> LookupAsync(QuickLookupRequest request, CancellationToken ct = default);
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

    public async Task<StandupSimulationResponse> SimulateStandupAsync(StandupSimulationRequest request, CancellationToken ct = default)
    {
        var agyPath = FindAgyExecutable();

        if (agyPath is not null)
        {
            try
            {
                var agyResult = await RunAgyStandupAsync(agyPath, request, ct);
                if (agyResult is not null)
                {
                    return agyResult;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AGY CLI standup simulation failed. Falling back to built-in heuristics.");
            }
        }

        return GenerateHeuristicStandup(request);
    }

    public async Task<DemoSimulationResponse> SimulateDemoAsync(DemoSimulationRequest request, CancellationToken ct = default)
    {
        var agyPath = FindAgyExecutable();

        if (agyPath is not null)
        {
            try
            {
                var agyResult = await RunAgyDemoAsync(agyPath, request, ct);
                if (agyResult is not null)
                {
                    return agyResult;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AGY CLI demo simulation failed. Falling back to built-in heuristics.");
            }
        }

        return GenerateHeuristicDemo(request);
    }

    public async Task<PingPongSimulationResponse> SimulatePingPongAsync(PingPongSimulationRequest request, CancellationToken ct = default)
    {
        var agyPath = FindAgyExecutable();

        if (agyPath is not null)
        {
            try
            {
                var agyResult = await RunAgyPingPongAsync(agyPath, request, ct);
                if (agyResult is not null)
                {
                    return agyResult;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AGY CLI ping-pong simulation failed. Falling back to built-in heuristics.");
            }
        }

        return GenerateHeuristicPingPong(request);
    }

    public async Task<QuickLookupResponse> LookupAsync(QuickLookupRequest request, CancellationToken ct = default)
    {
        var text = request.Text?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(text))
        {
            return new QuickLookupResponse(false, "", "", "Không có từ được chọn", "");
        }

        // 1. Check curriculum drills dictionary (0ms instant lookup)
        var curriculumMatch = curriculumService.LookupWordInCurriculum(text);
        if (curriculumMatch is not null)
        {
            return curriculumMatch;
        }

        // 2. Check built-in dev terms
        if (KnownDevTerms.TryGetValue(text, out var termData))
        {
            return new QuickLookupResponse(true, text, termData.Ipa, termData.MeaningVi, termData.Cue);
        }

        // 3. Attempt AGY CLI lookup for arbitrary sentence or word
        var agyPath = FindAgyExecutable();
        if (agyPath is not null)
        {
            try
            {
                var agyResult = await RunAgyLookupAsync(agyPath, text, ct);
                if (agyResult is not null)
                {
                    return agyResult;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AGY lookup failed for '{Text}'", text);
            }
        }

        // 4. Heuristic Fallback
        return GenerateHeuristicLookup(text);
    }

    private static readonly Dictionary<string, (string Ipa, string MeaningVi, string Cue)> KnownDevTerms = new(StringComparer.OrdinalIgnoreCase)
    {
        ["middleware"] = ("/ˈmɪd.əl.weər/", "Phần mềm trung gian xử lý request trong pipeline HTTP", "Khép nhẹ môi cho /m/, cuộn lưỡi nhẹ cho /l/"),
        ["concurrency"] = ("/kənˈkʌr.ən.si/", "Xử lý đồng thời nhiều tác vụ (đa luồng)", "Âm /k/ nổ vòm mềm, nhấn trọng âm 2"),
        ["asynchronous"] = ("/eɪˈsɪŋ.krə.nəs/", "Bất đồng bộ (không chặn luồng thực thi)", "Ngắt âm đuôi /s/ dứt khoát không nuốt âm"),
        ["deployment"] = ("/dɪˈplɔɪ.mənt/", "Triển khai phần mềm lên môi trường đích", "Bật /d/ và kết /t/ rõ ràng tại gờ lợi"),
        ["repository"] = ("/rɪˈpɒz.ɪ.tər.i/", "Mẫu thiết kế đóng gói tầng truy cập dữ liệu", "Âm /z/ rung mạnh dây thanh quản"),
        ["interface"] = ("/ˈɪn.tə.feɪs/", "Giao diện hợp đồng phương thức trong OOP", "Xì hơi /s/ ở cuối không rụng"),
        ["polymorphism"] = ("/ˌpɒl.iˈmɔː.fɪ.zəm/", "Tính đa hình trong lập trình hướng đối tượng", "Nhấn trọng âm /mɔː/, âm cuối /zəm/ rung cổ"),
        ["encapsulation"] = ("/ɪnˌkæp.sjʊˈleɪ.ʃən/", "Tính đóng gói dữ liệu và ẩn giấu chi tiết", "Bật hơi /p/ ở âm tiết thứ 2"),
        ["refactor"] = ("/ˌriːˈfæk.tər/", "Tái cấu trúc mã nguồn giữ nguyên hành vi", "Bật /k/ chặn rồi nối sang /t/"),
        ["pipeline"] = ("/ˈpaɪp.laɪn/", "Chuỗi xử lý dữ liệu liên hoàn (CI/CD / Request)", "Bật /p/ đôi dứt khoát"),
        ["exception"] = ("/ɪkˈsɛp.ʃən/", "Ngoại lệ phát sinh khi chạy chương trình", "Chặn /k/ rồi xì /s/, tròn môi cho /ʃ/"),
        ["deadlock"] = ("/ˈdɛd.lɒk/", "Khóa chết tài nguyên giữa các luồng đồng thời", "Đóng /d/ và bật /k/ ở cuối"),
        ["scalability"] = ("/ˌskeɪ.ləˈbɪl.ə.ti/", "Khả năng mở rộng chịu tải của hệ thống", "Xì /s/ nối /k/, gõ nhẹ flap T"),
        ["latency"] = ("/ˈleɪ.tən.si/", "Độ trễ phản hồi của hệ thống hoặc mạng", "Bật /t/ gờ lợi, âm cuối /si/"),
        ["throughput"] = ("/ˈθruː.pʊt/", "Thông lượng dữ liệu xử lý trên đơn vị thời gian", "Đầu lưỡi giữa răng cho /θ/, bật /t/ cuối"),
        ["observability"] = ("/əbˌzɜː.vəˈbɪl.ə.ti/", "Khả năng quan sát trạng thái nội tại hệ thống", "Rung /z/, cắn môi dưới cho /v/"),
        ["telemetry"] = ("/təˈlɛm.ɪ.tri/", "Dữ liệu đo đạc chỉ số vận hành tự động (Metrics/Traces)", "Bật /t/ gờ lợi, rung nhẹ /r/"),
        ["distributed"] = ("/dɪˈstrɪb.jʊ.tɪd/", "Kiến trúc phân tán trên nhiều node máy chủ", "Bật /tɪd/ rõ ràng ở cuối"),
        ["controller"] = ("/kənˈtrəʊ.lər/", "Bộ điều hướng tiếp nhận request trong MVC / Web API", "Âm /k/ bật dứt khoát"),
        ["caching"] = ("/ˈkæʃ.ɪŋ/", "Bộ nhớ đệm tăng tốc độ truy xuất dữ liệu", "Bật /k/, chu môi tròn cho /ʃ/"),
        ["authentication"] = ("/ɔːˌθen.tɪˈkeɪ.ʃən/", "Xác thực danh tính người dùng", "Đặt đầu lưỡi giữa răng cho /θ/"),
        ["authorization"] = ("/ˌɔː.θər.aɪˈzeɪ.ʃən/", "Phân quyền truy cập tài nguyên", "Âm /θ/ không rung và /z/ rung mạnh")
    };

    private static string? FindAgyExecutable()
    {
        if (Environment.GetEnvironmentVariable("DEVENGCOACH_DISABLE_AGY") is "1" or "true")
        {
            return null;
        }

        foreach (var path in PossibleAgyPaths)
        {
            if (File.Exists(path)) return path;
        }
        return null;
    }

    #region AGY CLI Integrations

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

        var output = await ExecuteAgyProcessAsync(agyPath, prompt, ct);
        if (string.IsNullOrWhiteSpace(output)) return null;

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

    private async Task<StandupSimulationResponse?> RunAgyStandupAsync(string agyPath, StandupSimulationRequest request, CancellationToken ct)
    {
        var prompt = $$"""
You are an expert English Pronunciation & Presentation Coach for Vietnamese Software Engineers.
Evaluate this 3-part Daily Standup report:
- Yesterday: "{{request.Yesterday}}"
- Today: "{{request.Today}}"
- Blockers: "{{request.Blockers ?? "None"}}"

Focus on:
1. Grammar accuracy (past tense -ed verbs for yesterday, future/continuous intent for today).
2. Ending consonants /t/, /d/, /s/, /z/ (checking unreleased codas, plural/voicing distinctions).
3. Senior Tech Lead phrasing refactor (concise, high-signal, executive delivery).

Return ONLY a JSON object (no markdown, no backticks) with keys:
{
  "grammarFeedback": "Detailed grammar feedback",
  "endingConsonantsFeedback": [
    "Feedback on /t/ sounds",
    "Feedback on /d/ sounds",
    "Feedback on /s/ and /z/ sounds"
  ],
  "seniorTechLeadRefactor": "3-part Senior Tech Lead version",
  "fluencyScore": 88,
  "deliveryTip": "Kinesthetic breathing/pitch delivery tip"
}
""";

        var output = await ExecuteAgyProcessAsync(agyPath, prompt, ct);
        if (string.IsNullOrWhiteSpace(output)) return null;

        var jsonMatch = Regex.Match(output, @"\{[\s\S]*\}");
        if (!jsonMatch.Success) return null;

        using var doc = JsonDocument.Parse(jsonMatch.Value);
        var root = doc.RootElement;

        var grammar = root.TryGetProperty("grammarFeedback", out var g) ? g.GetString() ?? "" : "";
        var refactor = root.TryGetProperty("seniorTechLeadRefactor", out var r) ? r.GetString() ?? "" : "";
        var score = root.TryGetProperty("fluencyScore", out var s) && s.TryGetInt32(out var sc) ? sc : 85;
        var tip = root.TryGetProperty("deliveryTip", out var d) ? d.GetString() ?? "" : "";

        var alerts = new List<string>();
        if (root.TryGetProperty("endingConsonantsFeedback", out var e) && e.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in e.EnumerateArray())
            {
                if (item.GetString() is { } str) alerts.Add(str);
            }
        }

        return new StandupSimulationResponse(
            Success: true,
            GrammarFeedback: grammar,
            EndingConsonantsFeedback: alerts,
            SeniorTechLeadRefactor: refactor,
            FluencyScore: Math.Clamp(score, 50, 100),
            DeliveryTip: tip
        );
    }

    private async Task<DemoSimulationResponse?> RunAgyDemoAsync(string agyPath, DemoSimulationRequest request, CancellationToken ct)
    {
        var prompt = $$"""
You are an expert English Speech Coach for Vietnamese Tech Leads.
Evaluate this Sprint Demo walkthrough:
- Context: "{{request.Context}}"
- Architecture/Under the hood: "{{request.Architecture}}"
- Technical Highlights: "{{request.TechnicalHighlights}}"
- Q&A Invite: "{{request.QaInvite}}"

Analyze connected speech mechanics:
1. Linking (consonant to vowel, consonant to consonant, liaison).
2. Flap T (American English [ɾ] in data, latency, automated, etc.).
3. Weak forms (vowel reduction to schwa in function words: to, for, and, can, of).

Return ONLY a JSON object (no markdown, no backticks) with keys:
{
  "grammarAndStructureFeedback": "Structure and clarity analysis",
  "linkingAlerts": ["Alert on consonant-to-vowel links"],
  "flapTAlerts": ["Alert on flap T opportunities"],
  "weakFormsAlerts": ["Alert on weak forms reduction"],
  "seniorDevPresentationScript": "Polished demo walkthrough script",
  "fluencyScore": 88,
  "pacingTip": "Pacing and cadence guidance"
}
""";

        var output = await ExecuteAgyProcessAsync(agyPath, prompt, ct);
        if (string.IsNullOrWhiteSpace(output)) return null;

        var jsonMatch = Regex.Match(output, @"\{[\s\S]*\}");
        if (!jsonMatch.Success) return null;

        using var doc = JsonDocument.Parse(jsonMatch.Value);
        var root = doc.RootElement;

        var grammar = root.TryGetProperty("grammarAndStructureFeedback", out var g) ? g.GetString() ?? "" : "";
        var script = root.TryGetProperty("seniorDevPresentationScript", out var s) ? s.GetString() ?? "" : "";
        var score = root.TryGetProperty("fluencyScore", out var sc) && sc.TryGetInt32(out var sci) ? sci : 85;
        var tip = root.TryGetProperty("pacingTip", out var pt) ? pt.GetString() ?? "" : "";

        var linkList = ExtractJsonStringArray(root, "linkingAlerts");
        var flapList = ExtractJsonStringArray(root, "flapTAlerts");
        var weakList = ExtractJsonStringArray(root, "weakFormsAlerts");

        var connectedSpeech = new ConnectedSpeechFeedback(linkList, flapList, weakList);

        return new DemoSimulationResponse(
            Success: true,
            GrammarAndStructureFeedback: grammar,
            ConnectedSpeech: connectedSpeech,
            SeniorDevPresentationScript: script,
            FluencyScore: Math.Clamp(score, 50, 100),
            PacingTip: tip
        );
    }

    private async Task<PingPongSimulationResponse?> RunAgyPingPongAsync(string agyPath, PingPongSimulationRequest request, CancellationToken ct)
    {
        var inputPayload = string.IsNullOrWhiteSpace(request.FullResponse)
            ? $"Answer: {request.Answer} | Detail: {request.Detail} | QuestionBack: {request.QuestionBack}"
            : request.FullResponse;

        var prompt = $$"""
You are an expert English Small Talk & Communication Coach for Vietnamese Software Engineers.
Evaluate this response using the A-D-Q formula (Answer -> Detail -> Question back):
Topic: "{{request.Topic ?? "Daily Team Sync / Watercooler"}}"
Learner Response: "{{inputPayload}}"

Return ONLY a JSON object (no markdown, no backticks) with keys:
{
  "naturalnessScore": 90,
  "pingPongTransitionQuality": "Analysis of the transition back to the peer",
  "hasDirectAnswer": true,
  "hasDetail": true,
  "hasQuestionBack": true,
  "feedback": "Feedback on A-D-Q execution and conversational momentum",
  "seniorDevRefactoring": "Senior engineer natural conversational response"
}
""";

        var output = await ExecuteAgyProcessAsync(agyPath, prompt, ct);
        if (string.IsNullOrWhiteSpace(output)) return null;

        var jsonMatch = Regex.Match(output, @"\{[\s\S]*\}");
        if (!jsonMatch.Success) return null;

        using var doc = JsonDocument.Parse(jsonMatch.Value);
        var root = doc.RootElement;

        var score = root.TryGetProperty("naturalnessScore", out var ns) && ns.TryGetInt32(out var nsi) ? nsi : 80;
        var transition = root.TryGetProperty("pingPongTransitionQuality", out var tq) ? tq.GetString() ?? "" : "";
        var hasA = root.TryGetProperty("hasDirectAnswer", out var ha) && ha.GetBoolean();
        var hasD = root.TryGetProperty("hasDetail", out var hd) && hd.GetBoolean();
        var hasQ = root.TryGetProperty("hasQuestionBack", out var hq) && hq.GetBoolean();
        var fb = root.TryGetProperty("feedback", out var f) ? f.GetString() ?? "" : "";
        var refactor = root.TryGetProperty("seniorDevRefactoring", out var sr) ? sr.GetString() ?? "" : "";

        return new PingPongSimulationResponse(
            Success: true,
            NaturalnessScore: Math.Clamp(score, 50, 100),
            PingPongTransitionQuality: transition,
            HasDirectAnswer: hasA,
            HasDetail: hasD,
            HasQuestionBack: hasQ,
            Feedback: fb,
            SeniorDevRefactoring: refactor
        );
    }

    private static List<string> ExtractJsonStringArray(JsonElement root, string propertyName)
    {
        var list = new List<string>();
        if (root.TryGetProperty(propertyName, out var element) && element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
            {
                if (item.GetString() is { } str) list.Add(str);
            }
        }
        return list;
    }

    private static async Task<string?> ExecuteAgyProcessAsync(string agyPath, string prompt, CancellationToken ct)
    {
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
        return await outputTask;
    }

    #endregion

    #region Heuristic Fallback Analyzers

    private static AiEvaluationResponse GenerateHeuristicEvaluation(string inputText, Lesson? lesson)
    {
        var alerts = new List<string>();
        var corrections = new List<string>();
        var textLower = inputText.ToLowerInvariant();

        if (textLower.Contains("yesterday") && (textLower.Contains(" i work ") || textLower.Contains(" i test ") || textLower.Contains(" i fix ")))
        {
            corrections.Add("Chia thì quá khứ cho hành động đã hoàn tất hôm qua: 'worked' thay vì 'work', 'tested' thay vì 'test', 'fixed' thay vì 'fix'.");
            alerts.Add("Cơ học âm đuôi -ed: 'worked' -> /wɜːrkt/ (bật âm /t/ dứt khoát), 'fixed' -> /fɪkst/ (chặn /k/ rồi xì /s/ và bật /t/).");
        }

        if (textLower.Contains("in develop branch") || textLower.Contains("to develop branch"))
        {
            corrections.Add("Thiếu mạo từ 'the': Nên dùng 'the develop branch' hoặc 'the feature branch'.");
        }

        if (textLower.Contains("wait user") || textLower.Contains("wait response"))
        {
            corrections.Add("Động từ 'wait' cần giới từ 'for': 'wait for the user response'.");
        }

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

    private static StandupSimulationResponse GenerateHeuristicStandup(StandupSimulationRequest request)
    {
        var grammarIssues = new List<string>();
        var consonantAlerts = new List<string>();
        var combinedText = $"{request.Yesterday} {request.Today} {request.Blockers ?? ""}".Trim();
        var yLower = request.Yesterday.ToLowerInvariant();
        var tLower = request.Today.ToLowerInvariant();
        var bLower = (request.Blockers ?? "").ToLowerInvariant();

        // 1. Grammar & Past Tense Detection
        var uninflectedVerbs = new[]
        {
            ("work", "worked", "/wɜːrkt/ (/t/)"),
            ("fix", "fixed", "/fɪkst/ (/t/)"),
            ("test", "tested", "/ˈtɛstɪd/ (/ɪd/)"),
            ("merge", "merged", "/mɜːrdʒd/ (/d/)"),
            ("deploy", "deployed", "/dɪˈplɔɪd/ (/d/)"),
            ("create", "created", "/kriˈeɪtɪd/ (/ɪd/)"),
            ("finish", "finished", "/ˈfɪnɪʃt/ (/t/)"),
            ("push", "pushed", "/pʊʃt/ (/t/)"),
            ("review", "reviewed", "/rɪˈvjuːd/ (/d/)"),
            ("implement", "implemented", "/ˈɪmpləmɛntɪd/ (/ɪd/)")
        };

        var foundUninflected = new List<string>();
        foreach (var (baseVerb, pastVerb, _) in uninflectedVerbs)
        {
            if (Regex.IsMatch(yLower, $@"\b(i|we)\s+{baseVerb}\b") ||
                Regex.IsMatch(yLower, $@"\byesterday\s+.*?\b{baseVerb}\b"))
            {
                foundUninflected.Add($"'{baseVerb}' -> đổi thành '{pastVerb}'");
            }
        }

        if (foundUninflected.Count > 0)
        {
            grammarIssues.Add($"Chia quá khứ cho mục Yesterday: {string.Join(", ", foundUninflected)}.");
        }

        if (yLower.Contains("in develop branch") || tLower.Contains("in develop branch"))
        {
            grammarIssues.Add("Thiếu mạo từ xác định: dùng 'on the develop branch' thay vì 'in develop branch'.");
        }

        if (bLower.Contains("wait pr") || bLower.Contains("wait review") || bLower.Contains("wait qa"))
        {
            grammarIssues.Add("Động từ 'wait' cần giới từ: dùng 'waiting for PR review' hoặc 'blocked on QA feedback'.");
        }

        if (grammarIssues.Count == 0)
        {
            grammarIssues.Add("Cấu trúc ngữ pháp 3 phần đạt chuẩn: thì quá khứ hoàn chỉnh, định hướng công việc hôm nay rõ ràng.");
        }

        // 2. Ending Consonants /t/, /d/, /s/, /z/ Feedback
        consonantAlerts.Add("Âm đuôi /t/: Với 'worked' (/wɜːrkt/), 'pushed' (/pʊʃt/), 'ticket' (/ˈtɪkɪt/), bật đầu lưỡi vô thanh dứt khoát vào nướu răng trên, tuyệt đối không nuốt âm.");
        consonantAlerts.Add("Âm đuôi /d/: Với 'merged' (/mɜːrdʒd/), 'deployed' (/dɪˈplɔɪd/), 'backend' (/ˈbæk.ɛnd/), chặn đầu lưỡi và rung nhẹ thanh quản (voiced), không thả luồng hơi mạnh như /t/.");
        consonantAlerts.Add("Âm đuôi /s/: Với danh từ số nhiều sau âm vô thanh ('tests', 'commits', 'tasks'), xì hơi sắc và đều qua kẽ răng.");
        consonantAlerts.Add("Âm đuôi /z/: Với các đuôi số nhiều/ngôi thứ 3 sau nguyên âm hoặc phụ âm hữu thanh ('services' /ˈsɜːrvɪsɪz/, 'APIs' /ˌeɪ.piːˈaɪz/, 'dependencies', 'blockers' /ˈblɑːkərz/), bắt buộc rung thanh quản.");
        consonantAlerts.Add("Quy tắc đuôi -ed: /t/ sau âm vô thanh (/p, k, f, s, ʃ, tʃ/), /d/ sau âm hữu thanh (nguyên âm, /b, g, v, z, m, n, l, r/), và /ɪd/ sau /t/ hoặc /d/ ('tested', 'created').");

        // 3. Senior Tech Lead Phrasing Refactor
        var cleanYesterday = PolishSentenceForStandup(request.Yesterday, isPast: true);
        var cleanToday = PolishSentenceForStandup(request.Today, isPast: false);
        var cleanBlockers = string.IsNullOrWhiteSpace(request.Blockers) || bLower.Contains("none") || bLower.Contains("no blocker")
            ? "No blockers at the moment. Everything is tracking smoothly on schedule."
            : $"Currently blocked on {request.Blockers.Trim().TrimEnd('.')}; syncing with the lead to unblock by noon.";

        var refactored = $"""
Yesterday: {cleanYesterday}
Today: {cleanToday}
Blockers: {cleanBlockers}
""";

        var score = 85;
        if (foundUninflected.Count > 0) score -= 8;
        if (request.Yesterday.Length > 20 && request.Today.Length > 20) score += 5;

        return new StandupSimulationResponse(
            Success: true,
            GrammarFeedback: string.Join(" ", grammarIssues),
            EndingConsonantsFeedback: consonantAlerts,
            SeniorTechLeadRefactor: refactored,
            FluencyScore: Math.Clamp(score, 60, 95),
            DeliveryTip: "Giữ tư thế thẳng lưng, nói với nhịp điệu dứt khoát (staccato cadence) và hạ cao độ ở cuối mỗi mục (downward inflection) để toát lên phong thái làm chủ tiến độ của Tech Lead."
        );
    }

    private static DemoSimulationResponse GenerateHeuristicDemo(DemoSimulationRequest request)
    {
        var structureIssues = new List<string>();
        if (string.IsNullOrWhiteSpace(request.Context)) structureIssues.Add("Phần Context nên tóm lược ngắn gọn bài toán kinh doanh hoặc pain point của người dùng.");
        if (string.IsNullOrWhiteSpace(request.Architecture)) structureIssues.Add("Phần Architecture cần nêu rõ mô hình luồng dữ liệu, caching hoặc minimal API endpoint liên quan.");
        if (string.IsNullOrWhiteSpace(request.TechnicalHighlights)) structureIssues.Add("Phần Highlights nên có số liệu cụ thể (ví dụ: latency giảm 35%, 100% test coverage).");
        if (string.IsNullOrWhiteSpace(request.QaInvite)) structureIssues.Add("Phần Q&A Invite nên mời mọi người đặt câu hỏi cởi mở.");

        if (structureIssues.Count == 0)
        {
            structureIssues.Add("Cấu trúc 4 phần của bài Sprint Demo rất chuẩn chỉ: đi từ bài toán người dùng, đào sâu kiến trúc, chứng minh bằng số liệu và mở màn Q&A chuyên nghiệp.");
        }

        // Connected speech: Linking
        var linkingAlerts = new List<string>
        {
            "Consonant-to-Vowel Linking: Nối âm phụ âm cuối với nguyên âm đầu của từ kế tiếp mà không ngắt hơi (ví dụ: 'built in' nối thành /bɪl-tɪn/, 'set up' nối thành /sɛ-tʌp/, 'rolled out' nối thành /roʊl-daʊt/).",
            "Transition Linking: Sử dụng các cụm liên kết tự nhiên khi chuyển phần: 'Now, moving on to our architecture...', 'Looking under the hood...', 'As you can see on the telemetry dashboard...'"
        };

        // Connected speech: Flap T
        var flapTAlerts = new List<string>
        {
            "Flap T [ɾ] trong thuật ngữ công nghệ: Trong tiếng Anh-Mỹ, âm /t/ giữa 2 nguyên âm hoặc sau /r/ trước nguyên âm ('data' /ˈdeɪt̬ə/, 'latency' /ˈleɪt̬ənsi/, 'automated' /ˈɔːt̬əmeɪtɪd/, 'critical' /ˈkrɪt̬ɪkəl/) được vỗ nhẹ đầu lưỡi thành Flap T [ɾ] (tương tự âm 'đ' tiếng Việt lướt rất nhanh), giúp nhịp nói mềm mại hơn.",
            "Tránh bật /t/ quá cứng (aspirated) trong 'data' hay 'utility' khi trình bày kỹ thuật với team quốc tế."
        };

        // Connected speech: Weak Forms
        var weakFormsAlerts = new List<string>
        {
            "Weak Forms (Giảm âm): Hạ nhẹ và phát âm âm schwa /ə/ ở các từ chức năng: 'to' (/tə/), 'for' (/fər/), 'and' (/ən/), 'can' (/kən/), 'of' (/əv/).",
            "Nguyên tắc Stress-timing: Chỉ nhấn mạnh trọng âm vào các Content Words kỹ thuật chính ('architecture', 'concurrency', 'throughput', 'resilience', 'telemetry') thay vì phát âm đều từng từ."
        };

        var script = $"""
Context: "To give everyone a quick backdrop: {request.Context.Trim().TrimEnd('.')}."
Under The Hood: "Architecturally, {request.Architecture.Trim().TrimEnd('.')}."
Technical Highlights: "From an engineering perspective, {request.TechnicalHighlights.Trim().TrimEnd('.')}."
Q&A: "{request.QaInvite.Trim().TrimEnd('.')} I'd love to open the floor for any questions, architectural trade-off discussions, or feedback."
""";

        return new DemoSimulationResponse(
            Success: true,
            GrammarAndStructureFeedback: string.Join(" ", structureIssues),
            ConnectedSpeech: new ConnectedSpeechFeedback(linkingAlerts, flapTAlerts, weakFormsAlerts),
            SeniorDevPresentationScript: script,
            FluencyScore: 88,
            PacingTip: "Duy trì tốc độ 120-135 từ/phút khi trình bày kiến trúc. Chèn một nhịp dừng 1 giây (micro-pause) trước khi công bố số liệu hiệu năng quan trọng để tạo điểm nhấn thuyết phục."
        );
    }

    private static PingPongSimulationResponse GenerateHeuristicPingPong(PingPongSimulationRequest request)
    {
        var rawAnswer = request.Answer ?? "";
        var rawDetail = request.Detail ?? "";
        var rawQuestion = request.QuestionBack ?? "";
        var full = request.FullResponse ?? $"{rawAnswer} {rawDetail} {rawQuestion}".Trim();

        var hasA = !string.IsNullOrWhiteSpace(rawAnswer) ||
                   Regex.IsMatch(full, @"\b(good|great|fine|well|pretty|busy|not bad|awesome|chilling|productive|fantastic|okay|ok)\b", RegexOptions.IgnoreCase);

        var hasQ = !string.IsNullOrWhiteSpace(rawQuestion) ||
                   full.Contains('?') ||
                   Regex.IsMatch(full, @"\b(how about|what about|how are you|how's your|how was|and you|yourself)\b", RegexOptions.IgnoreCase);

        var hasD = !string.IsNullOrWhiteSpace(rawDetail) ||
                   full.Length > (hasA ? 25 : 15);

        string transitionQuality;
        int score;

        if (hasA && hasD && hasQ)
        {
            transitionQuality = "Xuất sắc (Smooth & Engaging): Cấu trúc A-D-Q hoàn chỉnh. Câu trả lời vừa thỏa mãn câu hỏi ban đầu, vừa đưa ra thông tin kết nối (Detail hook), và chuyền bóng lại bằng câu hỏi tự nhiên (Question back) giúp duy trì nhịp đối thoại mượt mà.";
            score = 92;
        }
        else if (!hasQ)
        {
            transitionQuality = "Bế tắc (Conversational Dead End): Thiếu câu hỏi ngược (Question back). Trong văn hóa tech quốc tế, không hỏi ngược lại khiến đối phương cảm thấy bạn đang kết thúc cuộc hội thoại hoặc thiếu sự quan tâm đồng đội.";
            score = 68;
        }
        else if (!hasD)
        {
            transitionQuality = "Cộc lốc (Too Brief): Thiếu chi tiết bổ trợ (Detail hook). Chỉ trả lời cộc lốc rồi hỏi lại ngay ('I'm good, and you?') khiến cuộc trò chuyện mang tính thủ tục, chưa tạo được sự gắn kết chuyên nghiệp (rapport).";
            score = 74;
        }
        else
        {
            transitionQuality = "Cần cải thiện (Incomplete): Câu trả lời chưa đủ thành phần A-D-Q để tạo nhịp bóng ping-pong tự nhiên.";
            score = 60;
        }

        var feedback = $"Phân tích A-D-Q: [Answer: {(hasA ? "Đạt" : "Thiếu")}] | [Detail: {(hasD ? "Đạt" : "Thiếu")}] | [Question back: {(hasQ ? "Đạt" : "Thiếu")}].";

        var refactored = """
"Doing great, thanks! (Answer)
We just wrapped up our sprint deployment early and all integration tests are green. (Detail)
How about yourself? How is your week shaping up? (Question back)"
""";

        return new PingPongSimulationResponse(
            Success: true,
            NaturalnessScore: score,
            PingPongTransitionQuality: transitionQuality,
            HasDirectAnswer: hasA,
            HasDetail: hasD,
            HasQuestionBack: hasQ,
            Feedback: feedback,
            SeniorDevRefactoring: refactored
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

    private static string PolishSentenceForStandup(string text, bool isPast)
    {
        var t = text.Trim().TrimEnd('.');
        if (string.IsNullOrWhiteSpace(t)) return isPast ? "Completed planned sprint tasks." : "Proceeding with daily sprint backlog.";

        if (isPast)
        {
            if (t.StartsWith("yesterday", StringComparison.OrdinalIgnoreCase))
            {
                t = Regex.Replace(t, @"^yesterday\s*(i|we)?\s*", "", RegexOptions.IgnoreCase).Trim();
            }

            if (t.StartsWith("work on", StringComparison.OrdinalIgnoreCase))
                t = "Worked on" + t["work on".Length..];
            else if (t.StartsWith("fix", StringComparison.OrdinalIgnoreCase))
                t = "Fixed" + t["fix".Length..];
            else if (t.StartsWith("test", StringComparison.OrdinalIgnoreCase))
                t = "Tested" + t["test".Length..];
            else if (t.StartsWith("merge", StringComparison.OrdinalIgnoreCase))
                t = "Merged" + t["merge".Length..];

            return $"Completed and delivered {t}.";
        }
        else
        {
            if (t.StartsWith("today", StringComparison.OrdinalIgnoreCase))
            {
                t = Regex.Replace(t, @"^today\s*(i will|i'll|i)?\s*", "", RegexOptions.IgnoreCase).Trim();
            }

            return $"Prioritizing {t} with target completion before EOD.";
        }
    }

    private async Task<QuickLookupResponse?> RunAgyLookupAsync(string agyPath, string text, CancellationToken ct)
    {
        var prompt = $$"""
You are an expert English Speech Coach for Vietnamese Developers.
Analyze the following English word or sentence: "{{text}}"

Return ONLY a JSON object (no markdown, no backticks) with:
{
  "ipa": "Accurate IPA transcription",
  "meaningVi": "Clear, concise Vietnamese meaning in software engineering or daily tech context",
  "phoneticCue": "Physical mouth/tongue mechanical advice for Vietnamese learners"
}
""";

        var output = await ExecuteAgyProcessAsync(agyPath, prompt, ct);
        if (string.IsNullOrWhiteSpace(output)) return null;

        var jsonMatch = Regex.Match(output, @"\{[\s\S]*\}");
        if (!jsonMatch.Success) return null;

        try
        {
            using var doc = JsonDocument.Parse(jsonMatch.Value);
            var root = doc.RootElement;
            var ipa = root.TryGetProperty("ipa", out var ipaElem) ? ipaElem.GetString() ?? "" : "";
            var meaningVi = root.TryGetProperty("meaningVi", out var mElem) ? mElem.GetString() ?? "" : "";
            var cue = root.TryGetProperty("phoneticCue", out var cElem) ? cElem.GetString() ?? "" : "";

            return new QuickLookupResponse(true, text, ipa, meaningVi, cue);
        }
        catch
        {
            return null;
        }
    }

    private static QuickLookupResponse GenerateHeuristicLookup(string text)
    {
        var isSingleWord = !text.Contains(' ');
        var ipa = isSingleWord ? $"/{text.ToLowerInvariant()}/" : "Connected speech / Phrase";
        var meaning = isSingleWord ? $"Từ vựng kỹ thuật: \"{text}\"" : $"Cụm từ / Câu: \"{text}\"";
        var cue = "Chú ý phát âm rõ âm đuôi (coda /t/, /d/, /s/, /z/), đặt đầu lưỡi đúng gờ lợi trên.";

        return new QuickLookupResponse(true, text, ipa, meaning, cue);
    }

    #endregion
}
