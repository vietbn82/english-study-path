using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using DevEngCoach.Common;
using Microsoft.Extensions.Logging;

namespace DevEngCoach.Services;

/// <summary>
/// Contract for executive AI Sparring Partner simulating high-stakes tech leadership conversations.
/// </summary>
public interface ISparringService
{
    /// <summary>
    /// Retrieves all available executive sparring scenarios.
    /// </summary>
    IReadOnlyList<SparringScenario> GetScenarios();

    /// <summary>
    /// Processes a user conversation turn and produces coaching evaluations, scores, and next challenge.
    /// </summary>
    Task<SparringResponse> ProcessTurnAsync(SparringTurnRequest request, CancellationToken ct = default);
}

/// <summary>
/// Domain service powering high-stakes AI sparring sessions with phonetic and diplomacy coaching.
/// </summary>
public sealed class SparringService(ILogger<SparringService>? logger = null) : ISparringService
{
    private static readonly string[] PossibleAgyPaths =
    [
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "agy", "bin", "agy.exe"),
        "agy.exe",
        "agy"
    ];

    private static readonly Regex FillerRegex = new(
        @"\b(uhm|um|uh|er|ah|like|actually|basically|you know|literally|i mean|sort of|kind of)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly SparringScenario[] DefaultScenarios =
    [
        new(
            Id: "arch-debate",
            Title: "Microservices vs Modular Monolith",
            Category: "Architecture & System Design",
            RoleDescription: "Staff Architect challenging data consistency, blast radius, latency",
            OpeningLine: "We're seeing significant pushback on breaking our core service into microservices. How do you plan to handle distributed transactions, data consistency, and the increased network latency without blowing up our blast radius?",
            KeyVocabulary:
            [
                "distributed transactions",
                "eventual consistency",
                "blast radius",
                "modular monolith",
                "network latency",
                "outbox pattern",
                "domain-driven design",
                "idempotency"
            ]
        ),
        new(
            Id: "incident-sev1",
            Title: "Production DB Connection Pool Exhaustion",
            Category: "Incident Response & Triage",
            RoleDescription: "VP of Engineering demanding immediate triage, customer impact, root cause",
            OpeningLine: "The checkout service is dropping 40% of customer orders right now. Telemetry indicates connection pool starvation on Postgres Primary. Give me the immediate blast radius, our mitigation plan for the next 15 minutes, and who is on communications.",
            KeyVocabulary:
            [
                "connection pool",
                "triage",
                "mitigation",
                "pg_stat_activity",
                "failover",
                "circuit breaker",
                "customer impact",
                "root cause"
            ]
        ),
        new(
            Id: "scope-pushback",
            Title: "Negotiating 50% Timeline Cut",
            Category: "Engineering Leadership & Stakeholder Alignment",
            RoleDescription: "Product Director asking to skip automated tests and refactoring",
            OpeningLine: "Marketing already scheduled the launch campaign for next Friday. Leadership wants this delivered in half the estimated time. Can we just skip writing unit and integration tests and defer the refactoring until Q3?",
            KeyVocabulary:
            [
                "technical debt",
                "regression risk",
                "trade-off",
                "minimum viable scope",
                "critical path",
                "quality assurance",
                "blast radius",
                "fast-follow"
            ]
        )
    ];

    public IReadOnlyList<SparringScenario> GetScenarios() => DefaultScenarios;

    public async Task<SparringResponse> ProcessTurnAsync(SparringTurnRequest request, CancellationToken ct = default)
    {
        var scenario = DefaultScenarios.FirstOrDefault(s => string.Equals(s.Id, request.ScenarioId, StringComparison.OrdinalIgnoreCase))
            ?? DefaultScenarios[0];

        var agyPath = FindAgyExecutable();
        if (agyPath is not null)
        {
            try
            {
                var agyResponse = await RunAgySparringTurnAsync(agyPath, request, scenario, ct);
                if (agyResponse is not null)
                {
                    return agyResponse;
                }
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "AI Coach CLI execution failed or timed out. Falling back to built-in heuristic evaluation.");
            }
        }

        return GenerateHeuristicSparring(request, scenario);
    }

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

    #region External AI Coach CLI Integration

    private static async Task<SparringResponse?> RunAgySparringTurnAsync(
        string agyPath,
        SparringTurnRequest request,
        SparringScenario scenario,
        CancellationToken ct)
    {
        var prompt = $$"""
You are an executive AI Sparring Partner simulating high-stakes engineering leadership conversations.
Persona: {{scenario.RoleDescription}}
Scenario: {{scenario.Title}}
Context: {{scenario.OpeningLine}}
Key Technical Vocabulary: {{string.Join(", ", scenario.KeyVocabulary)}}

User Speech: "{{request.UserSpeech}}"

Evaluate the user's response:
1. In-character persona response to their technical points and trade-offs.
2. Diplomacy score (1-100) based on professional framing, collaboration, and de-escalation.
3. Technical clarity score (1-100) based on architecture depth, specific metrics, and vocabulary.
4. Pronunciation alerts focusing on ending consonants /t/, /d/, /s/, /z/, /θ/ in technical words.
5. Filler words detected (e.g. uhm, like, actually, basically, you know).
6. Senior Lead Refinement: How a Staff+ / Principal Engineer would state this exact argument crisply and diplomatically.
7. Next follow-up question that challenges their assumptions at a senior level.

Return ONLY a JSON object (no markdown, no backticks):
{
  "aiResponse": "in-character response",
  "diplomacyScore": 85,
  "technicalClarityScore": 82,
  "pronunciationAlerts": ["alert 1", "alert 2"],
  "fillerWordsDetected": ["actually", "basically"],
  "seniorLeadRefinement": "staff engineer refinement",
  "nextQuestion": "sharp next question"
}
""";

        var output = await ExecuteAgyProcessAsync(agyPath, prompt, ct);
        if (string.IsNullOrWhiteSpace(output)) return null;

        var jsonMatch = Regex.Match(output, @"\{[\s\S]*\}");
        if (!jsonMatch.Success) return null;

        using var doc = JsonDocument.Parse(jsonMatch.Value);
        var root = doc.RootElement;

        var aiResponse = root.TryGetProperty("aiResponse", out var air) ? air.GetString() ?? "" : "";
        var dipScore = root.TryGetProperty("diplomacyScore", out var ds) && ds.TryGetInt32(out var dsi) ? dsi : 75;
        var techScore = root.TryGetProperty("technicalClarityScore", out var ts) && ts.TryGetInt32(out var tsi) ? tsi : 75;
        var refinement = root.TryGetProperty("seniorLeadRefinement", out var slr) ? slr.GetString() ?? "" : "";
        var nextQuestion = root.TryGetProperty("nextQuestion", out var nq) ? nq.GetString() ?? "" : "";

        IReadOnlyList<string> alerts = ExtractJsonStringArray(root, "pronunciationAlerts");
        if (alerts.Count == 0)
        {
            alerts = GeneratePronunciationAlerts(request.UserSpeech);
        }

        IReadOnlyList<string> fillers = ExtractJsonStringArray(root, "fillerWordsDetected");
        if (fillers.Count == 0)
        {
            fillers = DetectFillerWords(request.UserSpeech);
        }

        return new SparringResponse(
            AiResponse: aiResponse,
            DiplomacyScore: Math.Clamp(dipScore, 1, 100),
            TechnicalClarityScore: Math.Clamp(techScore, 1, 100),
            PronunciationAlerts: alerts,
            FillerWordsDetected: fillers,
            SeniorLeadRefinement: refinement,
            NextQuestion: nextQuestion
        );
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
        cts.CancelAfter(TimeSpan.FromSeconds(8));

        var outputTask = process.StandardOutput.ReadToEndAsync(cts.Token);
        var errorTask = process.StandardError.ReadToEndAsync(cts.Token);

        await process.WaitForExitAsync(cts.Token);
        return await outputTask;
    }

    private static List<string> ExtractJsonStringArray(JsonElement root, string propertyName)
    {
        var list = new List<string>();
        if (root.TryGetProperty(propertyName, out var element) && element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
            {
                if (item.GetString() is { } str && !string.IsNullOrWhiteSpace(str))
                {
                    list.Add(str);
                }
            }
        }
        return list;
    }

    #endregion

    #region Heuristic Fallback Engine

    private static SparringResponse GenerateHeuristicSparring(SparringTurnRequest request, SparringScenario scenario)
    {
        var speech = request.UserSpeech ?? string.Empty;
        var fillers = DetectFillerWords(speech);
        var pronunciationAlerts = GeneratePronunciationAlerts(speech);
        var (diplomacyScore, technicalClarityScore) = EvaluateScores(speech, scenario, fillers);

        var (aiResponse, nextQuestion, seniorLeadRefinement) = GenerateScenarioContent(speech, scenario);

        return new SparringResponse(
            AiResponse: aiResponse,
            DiplomacyScore: diplomacyScore,
            TechnicalClarityScore: technicalClarityScore,
            PronunciationAlerts: pronunciationAlerts,
            FillerWordsDetected: fillers,
            SeniorLeadRefinement: seniorLeadRefinement,
            NextQuestion: nextQuestion
        );
    }

    private static IReadOnlyList<string> DetectFillerWords(string speech)
    {
        if (string.IsNullOrWhiteSpace(speech)) return [];

        var matches = FillerRegex.Matches(speech);
        var list = new List<string>();
        foreach (Match m in matches)
        {
            var val = m.Value.ToLowerInvariant();
            if (!list.Contains(val))
            {
                list.Add(val);
            }
        }
        return list;
    }

    private static IReadOnlyList<string> GeneratePronunciationAlerts(string speech)
    {
        var alerts = new List<string>();
        var speechLower = speech.ToLowerInvariant();
        var words = Regex.Matches(speechLower, @"\b[a-zA-Z0-9_\-]+\b")
            .Select(m => m.Value)
            .Distinct()
            .ToList();

        // 1. Ending consonant /t/
        var tWords = words.Where(w =>
            (w.EndsWith("t") || w.EndsWith("te") || w.EndsWith("ct") || w.EndsWith("pt")) &&
            w.Length > 2 &&
            w is not "the" && !w.EndsWith("th")
        ).Take(3).ToList();

        if (tWords.Count > 0)
        {
            alerts.Add($"Ending stop /t/ in {FormatWords(tWords)}: Hold the unreleased stop or tap the tongue tip sharply against the alveolar ridge; avoid swallowing the final coda.");
        }
        else
        {
            alerts.Add("Ending stop /t/: Ensure alveolar stops in tech nouns (e.g. 'request', 'commit', 'blast') are crisp and never dropped.");
        }

        // 2. Ending voiced consonant /d/
        var dWords = words.Where(w =>
            (w.EndsWith("d") || w.EndsWith("de") || w.EndsWith("ed")) &&
            w.Length > 2
        ).Take(3).ToList();

        if (dWords.Count > 0)
        {
            alerts.Add($"Ending voiced stop /d/ in {FormatWords(dWords)}: Lightly voice the vocal cords at the alveolar ridge; avoid trailing off into silence or adding an unwanted schwa.");
        }
        else
        {
            alerts.Add("Ending voiced stop /d/: Maintain subtle vocal fold vibration on codas in words like 'build', 'node', 'thread'.");
        }

        // 3. Ending voiceless fricative /s/
        var sWords = words.Where(w =>
            (w.EndsWith("ce") || w.EndsWith("ss") || w.EndsWith("se")) ||
            (w.EndsWith("s") && (w.Contains("service") || w.Contains("status") || w.Contains("database") || w.Contains("process") || w.Contains("release") || w.Contains("metrics") || w.Contains("postgres")))
        ).Take(3).ToList();

        if (sWords.Count > 0)
        {
            alerts.Add($"Ending voiceless fricative /s/ in {FormatWords(sWords)}: Keep the tongue tip behind upper incisors with continuous unvoiced airflow without dropping the coda.");
        }
        else
        {
            alerts.Add("Ending voiceless fricative /s/: Sustain airflow through the alveolar ridge for nouns like 'service', 'database', and 'metrics'.");
        }

        // 4. Voiced ending /z/ (plural / third-person singulars)
        var zWords = words.Where(w =>
            w.EndsWith("s") &&
            (w.EndsWith("ers") || w.EndsWith("des") || w.EndsWith("ies") || w.EndsWith("ions") || w.EndsWith("ols") || w.EndsWith("pis") || w.EndsWith("ees"))
        ).Take(3).ToList();

        if (zWords.Count > 0)
        {
            alerts.Add($"Voiced ending /z/ in {FormatWords(zWords)}: Plural and third-person codas require vocal cord vibration; do not substitute with a silent ending.");
        }
        else
        {
            alerts.Add("Voiced ending /z/: Vibrate vocal folds on plural technical nouns like 'users', 'nodes', 'transactions'.");
        }

        // 5. Dental fricative /θ/
        var thWords = words.Where(w =>
            w.Contains("th") &&
            (w.Contains("through") || w.Contains("width") || w.Contains("both") || w.Contains("depth") || w.Contains("path") || w.Contains("monolith") || w.Contains("third"))
        ).Take(2).ToList();

        if (thWords.Count > 0)
        {
            alerts.Add($"Dental fricative /θ/ in {FormatWords(thWords)}: Place the tongue tip gently between the front teeth with steady unvoiced friction; avoid replacing it with /s/ or /t/.");
        }
        else
        {
            alerts.Add("Dental fricative /θ/: Keep the tongue tip between teeth for terms like 'throughput', 'bandwidth', and 'depth'.");
        }

        return alerts;
    }

    private static (int diplomacyScore, int technicalClarityScore) EvaluateScores(
        string speech,
        SparringScenario scenario,
        IReadOnlyList<string> fillers)
    {
        var speechLower = speech.ToLowerInvariant();
        var words = speechLower.Split([' ', ',', '.', '!', '?', ';', ':', '\r', '\n', '\t'], StringSplitOptions.RemoveEmptyEntries);

        // Diplomacy Score (1-100)
        var diplomacy = 72;

        string[] diplomacyKeywords =
        [
            "understand", "recommend", "propose", "trade-off", "tradeoff", "mitigate",
            "risk", "align", "partner", "phased", "safeguard", "prioritize", "balance",
            "strategy", "collaborate", "ensure", "customer impact", "alternative",
            "compromise", "agree", "appreciate", "perspective", "approach", "address"
        ];
        foreach (var kw in diplomacyKeywords)
        {
            if (speechLower.Contains(kw)) diplomacy += 4;
        }

        string[] aggressiveTerms =
        [
            "impossible", "stupid", "no way", "you can't", "not our fault", "ridiculous",
            "not my problem", "nonsense", "blame", "whatever", "hate", "dumb"
        ];
        foreach (var term in aggressiveTerms)
        {
            if (speechLower.Contains(term)) diplomacy -= 14;
        }

        diplomacy -= fillers.Count * 4;

        // Technical Clarity Score (1-100)
        var clarity = 55;

        foreach (var keyVocab in scenario.KeyVocabulary)
        {
            if (speechLower.Contains(keyVocab.ToLowerInvariant()))
            {
                clarity += 8;
            }
        }

        string[] techTerms =
        [
            "latency", "throughput", "p99", "saga", "outbox", "idempotent", "failover",
            "replica", "telemetry", "pool", "rollback", "metrics", "canary", "automation",
            "coverage", "integration", "descope", "sla", "slo", "pg_stat_activity",
            "circuit breaker", "monolith", "microservice", "partition", "asynchronous"
        ];
        foreach (var term in techTerms)
        {
            if (speechLower.Contains(term)) clarity += 5;
        }

        if (Regex.IsMatch(speechLower, @"\b\d+(\.\d+)?\s*(%|ms|s|m|min|minutes|hours|q[1-4]|nodes|tps)\b") ||
            Regex.IsMatch(speechLower, @"\b(first|second|third|initially|phase\s*1)\b"))
        {
            clarity += 8;
        }

        if (words.Length < 6)
        {
            clarity -= 20;
            diplomacy -= 10;
        }
        else if (words.Length >= 15)
        {
            clarity += 5;
            diplomacy += 3;
        }

        clarity -= fillers.Count * 3;

        return (Math.Clamp(diplomacy, 1, 100), Math.Clamp(clarity, 1, 100));
    }

    private static (string AiResponse, string NextQuestion, string SeniorLeadRefinement) GenerateScenarioContent(
        string speech,
        SparringScenario scenario)
    {
        var speechLower = speech.ToLowerInvariant();

        switch (scenario.Id.ToLowerInvariant())
        {
            case "arch-debate":
            {
                var ai = speechLower.Contains("outbox") || speechLower.Contains("eventual") || speechLower.Contains("monolith")
                    ? "That acknowledges our data integrity constraints, but an transactional outbox still requires asynchronous event relaying. If message dispatching falls behind write throughput during peak load, how will you protect downstream consumer SLAs?"
                    : speechLower.Contains("microservice") || speechLower.Contains("split")
                    ? "Independent deployments sound appealing on paper, but splitting before service boundaries stabilize drastically increases network overhead and debugging complexity across distributed traces."
                    : "You've outlined the high-level trade-off, but we have not addressed transactional integrity. If two decoupled boundaries fail mid-operation, who owns reconciliation?";

                var q = "When two decoupled services fail mid-transaction during a peak checkout spike, how does your distributed saga guarantee compensation without leaving customer accounts in an indeterminate state?";

                var refinement = "I propose we adopt a strictly bounded Modular Monolith first. By keeping domain models isolated within separate project assemblies while sharing a single transactional database, we avoid distributed transactions and network latency entirely. Once transaction boundaries and team ownership mature, extracting high-throughput services will follow a zero-downtime outbox migration pattern.";

                return (ai, q, refinement);
            }

            case "incident-sev1":
            {
                var ai = speechLower.Contains("pg_stat_activity") || speechLower.Contains("idle") || speechLower.Contains("terminate")
                    ? "Terminating idle transactions via pg_stat_activity gives us immediate breathing room. However, if client applications retry aggressively upon disconnect, we risk triggering a thundering herd on Postgres."
                    : speechLower.Contains("circuit breaker") || speechLower.Contains("failover")
                    ? "Tripping circuit breakers isolates failure, but we must verify that in-flight checkout transactions are not left hanging in payment gateways."
                    : "Understood on the high-level direction, but leadership needs immediate certainty on the blast radius and customer payment failure rate before we start dropping connections.";

                var q = "While we drain starved connections on Postgres Primary, what exact connection pool ceiling and keepalive timeout are you setting in the application config to prevent immediate re-starvation?";

                var refinement = "Incident Commander triage update: Blast radius is isolated to the checkout worker pool, impacting 40% of payment executions. In the next 15 minutes, we are terminating idle and long-running queries via pg_stat_activity, capping max pool connections at 80%, and shedding non-critical read traffic via circuit breakers. Sarah is leading communications in #incident-sev1 with updates every 10 minutes.";

                return (ai, q, refinement);
            }

            case "scope-pushback":
            {
                var ai = speechLower.Contains("descope") || speechLower.Contains("fast-follow") || speechLower.Contains("critical path")
                    ? "Descoping secondary features is acceptable to marketing, provided the core customer onboarding workflow is 100% stable and delivered by Friday morning."
                    : speechLower.Contains("regression") || speechLower.Contains("test") || speechLower.Contains("debt")
                    ? "I understand your concern about regressions, but marketing has already committed significant ad spend to next Friday's launch date. What is the absolute minimum automated test gate we need?"
                    : "I hear the engineering pushback, but we cannot move the launch date without executive intervention. We need a creative compromise that balances speed with baseline quality.";

                var q = "If we agree to freeze feature development 48 hours early, which exact automated integration tests will you keep in the CI gate to ensure Friday's launch has zero billing regressions?";

                var refinement = "I understand marketing's commitment for next Friday, and we are committed to helping the launch succeed. However, eliminating unit and integration tests introduces critical regression risk to our core payment flow, which could cause customer-facing downtime on launch day. Instead of skipping quality assurance, I propose we descope secondary UI animations and bulk export features, preserving our automated tests for the critical checkout path. We can deliver the remaining scope as a fast-follow in Sprint 14.";

                return (ai, q, refinement);
            }

            default:
            {
                var ai = "I appreciate your response. From an executive perspective, we need to ensure our technical implementation directly addresses business risk and operational reliability.";
                var q = "What is your fallback strategy if this implementation encounters unexpected production latency or service degradation?";
                var refinement = "I propose a phased rollout with clear guardrails. By instrumenting real-time telemetry and establishing automated rollback thresholds, we maintain system resilience while delivering the required functionality on schedule.";
                return (ai, q, refinement);
            }
        }
    }

    private static string FormatWords(IReadOnlyList<string> words) =>
        string.Join(", ", words.Select(w => $"'{w}'"));

    #endregion
}
