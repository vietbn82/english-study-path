using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace DevEngCoach.Services;

/// <summary>
/// Milestone Capstone Assessment Engine evaluating senior engineering spoken communication
/// across Days 30, 60, and 90 against industry rubrics.
/// </summary>
public sealed partial class CapstoneService(ILogger<CapstoneService>? logger = null) : ICapstoneService
{
    private static readonly Regex WordSplitRegex = new(@"\b[\w'-]+\b", RegexOptions.Compiled);
    private static readonly Regex FillerRegex = new(@"\b(um|uh|er|ah|like|you know|sort of|kind of)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // Day 30 Target Dictionaries
    private static readonly HashSet<string> Day30PastTenseVerbs = new(StringComparer.OrdinalIgnoreCase)
    {
        "fixed", "merged", "deployed", "tested", "implemented", "resolved",
        "updated", "refactored", "created", "shipped", "investigated", "pushed",
        "added", "built", "migrated", "configured", "debugged", "released", "verified"
    };

    private static readonly HashSet<string> Day30EndingConsonants = new(StringComparer.OrdinalIgnoreCase)
    {
        "endpoint", "request", "sprint", "task", "first", "last", "next",
        "post", "commit", "test", "build", "blocker", "client", "service", "status"
    };

    private static readonly HashSet<string> Day30TechVocab = new(StringComparer.OrdinalIgnoreCase)
    {
        "api", "endpoint", "service", "database", "query", "ticket", "jira",
        "pr", "pull request", "pipeline", "branch", "commit", "build", "test",
        "bug", "cache", "redis", "auth", "docker", "feature", "deployment", "merge"
    };

    // Day 60 Target Phrases and Flap-T
    private static readonly string[] Day60LinkingPhrases =
    [
        "spin it up", "roll it out", "set it up", "check it out", "kick it off",
        "point at", "look at", "built in", "pass it", "hand it over", "as well as",
        "set up", "turn on", "turn off", "shut down", "plug in", "bring up", "under the hood"
    ];

    private static readonly HashSet<string> Day60FlapTWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "data", "router", "bottleneck", "latency", "better", "critical",
        "automated", "little", "protocol", "pattern", "status", "setting", "iterative", "utility"
    };

    private static readonly HashSet<string> Day60TechVocab = new(StringComparer.OrdinalIgnoreCase)
    {
        "throughput", "latency", "scalability", "microservice", "event-driven",
        "architecture", "concurrency", "payload", "cache", "database", "kafka",
        "resilience", "telemetry", "benchmark", "trade-off", "distributed", "optimization"
    };

    // Day 90 Targets
    private static readonly string[] Day90DiplomaticPhrases =
    [
        "i would recommend", "from my perspective", "i see your point", "we should consider",
        "on the other hand", "trade-off", "in my experience", "i propose", "to mitigate"
    ];

    private static readonly HashSet<string> Day90SeniorVocab = new(StringComparer.OrdinalIgnoreCase)
    {
        "blast radius", "eventual consistency", "domain-driven design", "outbox pattern",
        "high availability", "sla", "slo", "sli", "governance", "technical debt",
        "scalability", "observability", "capacity planning", "idempotency", "fault tolerance"
    };

    public CapstoneSpec GetCapstoneSpec(int day) => day switch
    {
        30 => new CapstoneSpec(
            DayNumber: 30,
            Title: "Day 30 Milestone: 90-Second Standup Presentation",
            MilestoneName: "Milestone 1: Standup & Ending Consonants Foundation",
            TimeLimitSeconds: 90,
            TargetScenario: "Deliver a crisp, 90-second daily standup update covering yesterday's completed work, today's planned focus, and any current blockers or dependencies.",
            FocusPhonetics:
            [
                "Ending consonants /t/, /d/, /s/, /z/",
                "Past tense regular verb endings (-ed: /t/, /d/, /ɪd/)",
                "Crisp stop releases without trailing vowel epenthesis"
            ],
            EvaluationCriteria:
            [
                "Audible and crisp ending consonants without dropping final stops",
                "Accurate inflection of regular past-tense verbs (e.g., fixed, merged, deployed)",
                "Natural pacing within the 90-second limit (110-155 WPM)",
                "Structured standup tripartite layout: Yesterday, Today, Blockers"
            ],
            PassingStandard: "Overall score >= 70% across phonetics, fluency, structure, and technical terminology."
        ),

        60 => new CapstoneSpec(
            DayNumber: 60,
            Title: "Day 60 Milestone: 5-Minute Sprint Feature Demo",
            MilestoneName: "Milestone 2: Sprint Demo & Connected Speech Fluency",
            TimeLimitSeconds: 300,
            TargetScenario: "Deliver a 5-minute technical sprint demo to cross-functional stakeholders, explaining architectural decisions, system trade-offs, and exploring 'under the hood'.",
            FocusPhonetics:
            [
                "Connected speech & consonant-to-vowel linking (e.g., 'spin it up', 'roll it out')",
                "American Flap T in technical words (e.g., 'data', 'router', 'bottleneck')",
                "Weak forms of function words (of, to, and, for)",
                "Idiomatic technical phrasing (e.g., 'under the hood', 'out of the box')"
            ],
            EvaluationCriteria:
            [
                "Smooth connected speech transitions and liaison between word boundaries",
                "Natural flap T articulation without hyper-formal glottalization",
                "Structured demo walkthrough: Context, Architecture, Live Demo, Trade-offs",
                "Clear engineering vocabulary and trade-off justification"
            ],
            PassingStandard: "Overall score >= 70% with evident linking, natural stress, and clear technical narrative."
        ),

        90 => new CapstoneSpec(
            DayNumber: 90,
            Title: "Day 90 Capstone: Master 3-in-1 Engineering Communication",
            MilestoneName: "Milestone 3: Executive Engineering Fluency",
            TimeLimitSeconds: 600,
            TargetScenario: "Demonstrate senior executive engineering communication across three sequential high-stakes scenarios: (1) Rapid 90-second standup, (2) Defending an architectural design in a technical debate, and (3) Strategic 1-on-1 alignment with engineering leadership.",
            FocusPhonetics:
            [
                "Advanced prosodic intonation and pitch accentuation for contrast",
                "Diplomatic hedging phonetics and assertive phrasing",
                "Nuanced sentence stress during complex technical argumentation",
                "Fluid conversational transitions between disparate communication modes"
            ],
            EvaluationCriteria:
            [
                "Seamless context-switching across all three communication scenarios",
                "Persuasive technical defense balancing pragmatism and engineering excellence",
                "Constructive 1-on-1 collaboration and diplomatic feedback delivery",
                "Mastery of senior engineering discourse and executive vocabulary"
            ],
            PassingStandard: "Overall score >= 70% demonstrating comprehensive senior engineering communication mastery."
        ),

        _ => throw new ArgumentOutOfRangeException(nameof(day), day, "Milestone capstone specifications are only defined for Days 30, 60, and 90.")
    };

    public Task<CapstoneEvaluationResult> EvaluateCapstoneAsync(CapstoneSubmissionRequest request, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(request?.Transcript))
        {
            return Task.FromResult(new CapstoneEvaluationResult(
                Success: false,
                Scorecard: new CapstoneScorecard(
                    OverallScore: 0,
                    PhoneticScore: 0,
                    FluencyPacingScore: 0,
                    SentenceStructureScore: 0,
                    TechnicalVocabScore: 0,
                    Passed: false,
                    RubricFeedback: "Evaluation could not be performed: Spoken transcript is empty or missing.",
                    Strengths: [],
                    Improvements: ["Provide an audio recording or text transcript of your capstone presentation."]
                ),
                CertificateId: null,
                CertificateTitle: null,
                GraduationMessage: null
            ));
        }

        if (request.DayNumber is not (30 or 60 or 90))
        {
            return Task.FromResult(new CapstoneEvaluationResult(
                Success: false,
                Scorecard: new CapstoneScorecard(
                    OverallScore: 0,
                    PhoneticScore: 0,
                    FluencyPacingScore: 0,
                    SentenceStructureScore: 0,
                    TechnicalVocabScore: 0,
                    Passed: false,
                    RubricFeedback: $"Invalid capstone day: Day {request.DayNumber}. Milestone capstones are supported on Day 30, Day 60, and Day 90.",
                    Strengths: [],
                    Improvements: ["Submit your capstone for Day 30, Day 60, or Day 90."]
                ),
                CertificateId: null,
                CertificateTitle: null,
                GraduationMessage: null
            ));
        }

        logger?.LogInformation("Evaluating capstone submission for Day {DayNumber}", request.DayNumber);

        var transcript = request.Transcript.Trim();
        var wordMatches = WordSplitRegex.Matches(transcript);
        var wordCount = wordMatches.Count;
        var words = new HashSet<string>(wordMatches.Select(m => m.Value), StringComparer.OrdinalIgnoreCase);

        // Effective duration in seconds
        var duration = request.DurationSeconds > 0
            ? request.DurationSeconds
            : (int)Math.Max(15, Math.Round((wordCount / 130.0) * 60.0));

        var wpm = duration > 0 ? (wordCount / (double)duration) * 60.0 : 0.0;
        var fillerCount = FillerRegex.Matches(transcript).Count;

        var scorecard = request.DayNumber switch
        {
            30 => EvaluateDay30(transcript, words, wordCount, duration, wpm, fillerCount),
            60 => EvaluateDay60(transcript, words, wordCount, duration, wpm, fillerCount),
            90 => EvaluateDay90(transcript, words, wordCount, duration, wpm, fillerCount),
            _ => throw new InvalidOperationException()
        };

        string? certId = null;
        string? certTitle = null;
        string? gradMessage = null;

        if (scorecard.Passed)
        {
            certId = $"CERT-DEVENG-D{request.DayNumber}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
            certTitle = request.DayNumber switch
            {
                30 => "Milestone Certificate: Professional Standup & Pronunciation",
                60 => "Milestone Certificate: Sprint Demo & Technical Storytelling",
                90 => "Senior Engineering Communication Master Graduation Certificate",
                _ => "Milestone Certificate"
            };

            gradMessage = request.DayNumber switch
            {
                30 => "Congratulations! You have demonstrated clear consonant endings and structured updates in your daily standups.",
                60 => "Congratulations! You have showcased linked connected speech and fluent architectural walkthroughs.",
                90 => "Outstanding achievement! You have graduated from the DevEng 90-Day Coach with professional engineering fluency.",
                _ => "Congratulations on passing your milestone capstone!"
            };
        }

        return Task.FromResult(new CapstoneEvaluationResult(
            Success: true,
            Scorecard: scorecard,
            CertificateId: certId,
            CertificateTitle: certTitle,
            GraduationMessage: gradMessage
        ));
    }

    private static CapstoneScorecard EvaluateDay30(
        string transcript,
        HashSet<string> words,
        int wordCount,
        int duration,
        double wpm,
        int fillerCount)
    {
        var strengths = new List<string>();
        var improvements = new List<string>();

        // 1. Phonetics: Ending consonants /t/, /d/, /s/, /z/ & past-tense verbs
        var pastTenseHits = Day30PastTenseVerbs.Count(words.Contains);
        var endingConsonantHits = Day30EndingConsonants.Count(words.Contains);

        var phoneticScore = 55;
        phoneticScore += Math.Min(25, pastTenseHits * 8);
        phoneticScore += Math.Min(20, endingConsonantHits * 5);
        phoneticScore = Math.Clamp(phoneticScore, 20, 100);

        if (pastTenseHits >= 2)
        {
            strengths.Add($"Strong usage of past-tense regular verb endings ({pastTenseHits} identified: e.g. fixed, merged, deployed).");
        }
        else
        {
            improvements.Add("Incorporate more explicit past-tense verbs with clear /t/, /d/, or /ɪd/ coda releases for completed work.");
        }

        if (endingConsonantHits >= 3)
        {
            strengths.Add("Crisp articulation of terminal consonant clusters in technical nouns.");
        }
        else
        {
            improvements.Add("Pay extra attention to terminal stops (/t/, /d/, /s/, /z/) on words like 'endpoint', 'sprint', and 'test'.");
        }

        // 2. Fluency & Pacing (Target 90s, 110-155 WPM)
        var pacingScore = 70;
        if (wpm is >= 110 and <= 155)
        {
            pacingScore = 95;
            strengths.Add($"Optimal standup cadence at {Math.Round(wpm)} words per minute.");
        }
        else if (wpm is >= 90 and < 110 or > 155 and <= 180)
        {
            pacingScore = 80;
        }
        else
        {
            pacingScore = 60;
            improvements.Add($"Cadence was {Math.Round(wpm)} WPM. Aim for 110-150 WPM to maintain crisp standup momentum.");
        }

        if (fillerCount > 3)
        {
            pacingScore -= Math.Min(15, fillerCount * 3);
            improvements.Add($"Detected {fillerCount} filler words. Replace verbal hesitations with micro-pauses.");
        }

        pacingScore = Math.Clamp(pacingScore, 25, 100);

        // 3. Sentence Structure (Yesterday / Today / Blockers)
        var hasYesterday = Regex.IsMatch(transcript, @"\b(yesterday|completed|shipped|finished|worked on|merged|wrapped up)\b", RegexOptions.IgnoreCase);
        var hasToday = Regex.IsMatch(transcript, @"\b(today|planning to|working on|focusing on|will|going to|tackling)\b", RegexOptions.IgnoreCase);
        var hasBlockers = Regex.IsMatch(transcript, @"\b(blocker|blocked|no blocker|dependencies|dependency|clear|waiting for)\b", RegexOptions.IgnoreCase);

        var structureHits = (hasYesterday ? 1 : 0) + (hasToday ? 1 : 0) + (hasBlockers ? 1 : 0);
        var structureScore = structureHits switch
        {
            3 => 95,
            2 => 75,
            1 => 55,
            _ => 40
        };

        if (hasYesterday && hasToday && hasBlockers)
        {
            strengths.Add("Exemplary tripartite standup structure covering Yesterday, Today, and Blockers.");
        }
        else
        {
            if (!hasYesterday) improvements.Add("Explicitly state what was completed yesterday.");
            if (!hasToday) improvements.Add("Outline your primary focus for today.");
            if (!hasBlockers) improvements.Add("State your blocker status clearly (even if 'no blockers').");
        }

        // 4. Technical Vocabulary
        var techHits = Day30TechVocab.Count(words.Contains);
        var vocabScore = 50 + Math.Min(45, techHits * 8);
        vocabScore = Math.Clamp(vocabScore, 25, 100);

        if (techHits >= 4)
        {
            strengths.Add($"Rich domain-specific vocabulary ({techHits} standard engineering terms).");
        }
        else
        {
            improvements.Add("Integrate standard software terminology (e.g. PR, endpoint, pipeline, branch).");
        }

        var overallScore = (int)Math.Round((phoneticScore + pacingScore + structureScore + vocabScore) / 4.0);
        var passed = overallScore >= 70;

        var feedback = passed
            ? $"Day 30 Milestone Passed ({overallScore}/100). Excellent consonant endings and well-balanced standup delivery."
            : $"Day 30 Milestone Not Passed ({overallScore}/100). Focus on ending consonant clarity and the complete Yesterday/Today/Blocker structure.";

        return new CapstoneScorecard(
            OverallScore: overallScore,
            PhoneticScore: phoneticScore,
            FluencyPacingScore: pacingScore,
            SentenceStructureScore: structureScore,
            TechnicalVocabScore: vocabScore,
            Passed: passed,
            RubricFeedback: feedback,
            Strengths: strengths,
            Improvements: improvements
        );
    }

    private static CapstoneScorecard EvaluateDay60(
        string transcript,
        HashSet<string> words,
        int wordCount,
        int duration,
        double wpm,
        int fillerCount)
    {
        var strengths = new List<string>();
        var improvements = new List<string>();

        // 1. Phonetics: Connected Speech, Flap T, and Under the Hood
        var linkingHits = Day60LinkingPhrases.Count(p => transcript.Contains(p, StringComparison.OrdinalIgnoreCase));
        var flapTHits = Day60FlapTWords.Count(words.Contains);

        var phoneticScore = 50;
        phoneticScore += Math.Min(30, linkingHits * 10);
        phoneticScore += Math.Min(20, flapTHits * 5);
        phoneticScore = Math.Clamp(phoneticScore, 20, 100);

        if (linkingHits >= 2)
        {
            strengths.Add($"Effective connected speech and linking phrases ({linkingHits} instances detected).");
        }
        else
        {
            improvements.Add("Practice linking consonant-to-vowel phrases (e.g., 'spin it up', 'roll it out', 'under the hood').");
        }

        if (flapTHits >= 2)
        {
            strengths.Add($"Natural American flap T in technical vocabulary ({flapTHits} instances).");
        }
        else
        {
            improvements.Add("Use natural alveolar flap T pronunciation in words like 'data', 'router', and 'bottleneck'.");
        }

        // 2. Fluency & Pacing (Target 300s, 115-160 WPM)
        var pacingScore = 70;
        if (wpm is >= 115 and <= 160)
        {
            pacingScore = 95;
            strengths.Add($"Engaging sprint demo pacing at {Math.Round(wpm)} words per minute.");
        }
        else if (wpm is >= 95 and < 115 or > 160 and <= 185)
        {
            pacingScore = 80;
        }
        else
        {
            pacingScore = 60;
            improvements.Add($"Presentation speed was {Math.Round(wpm)} WPM. Target 115-160 WPM for technical clarity.");
        }

        if (fillerCount > 4)
        {
            pacingScore -= Math.Min(15, fillerCount * 2);
            improvements.Add($"Minimize filler phrases ({fillerCount} found) during technical walkthroughs.");
        }

        pacingScore = Math.Clamp(pacingScore, 25, 100);

        // 3. Sentence Structure: Context, Architecture, Demo, Trade-offs
        var hasContext = Regex.IsMatch(transcript, @"\b(problem|overview|goal|feature|built|presenting|welcome)\b", RegexOptions.IgnoreCase);
        var hasArch = Regex.IsMatch(transcript, @"\b(architecture|under the hood|flow|component|service|pipeline|design)\b", RegexOptions.IgnoreCase);
        var hasDemo = Regex.IsMatch(transcript, @"\b(demo|here we see|walkthrough|click|trigger|in action|response|dashboard)\b", RegexOptions.IgnoreCase);
        var hasTradeoffs = Regex.IsMatch(transcript, @"\b(trade-off|tradeoff|scalability|performance|latency|edge case|limitation)\b", RegexOptions.IgnoreCase);

        var structureHits = (hasContext ? 1 : 0) + (hasArch ? 1 : 0) + (hasDemo ? 1 : 0) + (hasTradeoffs ? 1 : 0);
        var structureScore = structureHits switch
        {
            4 => 95,
            3 => 80,
            2 => 65,
            1 => 50,
            _ => 35
        };

        if (structureHits >= 3)
        {
            strengths.Add("Well-rounded demo narrative spanning context, architecture, demonstration, and trade-offs.");
        }
        else
        {
            improvements.Add("Structure your demo explicitly into: Context -> Architecture ('under the hood') -> Walkthrough -> Trade-offs.");
        }

        // 4. Technical Vocabulary
        var techHits = Day60TechVocab.Count(words.Contains);
        var vocabScore = 50 + Math.Min(45, techHits * 8);
        vocabScore = Math.Clamp(vocabScore, 25, 100);

        if (techHits >= 4)
        {
            strengths.Add($"High technical fidelity with {techHits} advanced engineering terms.");
        }
        else
        {
            improvements.Add("Deepen technical explanations with terms like 'latency', 'throughput', 'scalability', and 'concurrency'.");
        }

        var overallScore = (int)Math.Round((phoneticScore + pacingScore + structureScore + vocabScore) / 4.0);
        var passed = overallScore >= 70;

        var feedback = passed
            ? $"Day 60 Milestone Passed ({overallScore}/100). Fluid connected speech with strong technical narrative."
            : $"Day 60 Milestone Not Passed ({overallScore}/100). Enhance connected linking and include deeper architectural trade-offs.";

        return new CapstoneScorecard(
            OverallScore: overallScore,
            PhoneticScore: phoneticScore,
            FluencyPacingScore: pacingScore,
            SentenceStructureScore: structureScore,
            TechnicalVocabScore: vocabScore,
            Passed: passed,
            RubricFeedback: feedback,
            Strengths: strengths,
            Improvements: improvements
        );
    }

    private static CapstoneScorecard EvaluateDay90(
        string transcript,
        HashSet<string> words,
        int wordCount,
        int duration,
        double wpm,
        int fillerCount)
    {
        var strengths = new List<string>();
        var improvements = new List<string>();

        // 1. Phonetics: Diplomatic hedging, contrastive prosody & executive poise
        var hedgeHits = Day90DiplomaticPhrases.Count(p => transcript.Contains(p, StringComparison.OrdinalIgnoreCase));
        var phoneticScore = 55 + Math.Min(40, hedgeHits * 10);
        phoneticScore = Math.Clamp(phoneticScore, 25, 100);

        if (hedgeHits >= 2)
        {
            strengths.Add($"Nuanced diplomatic hedging and assertive phrasing ({hedgeHits} instances).");
        }
        else
        {
            improvements.Add("Employ diplomatic hedges (e.g., 'from my perspective', 'we should consider', 'the primary trade-off').");
        }

        // 2. Fluency & Pacing (Multi-scenario sustained delivery)
        var pacingScore = 70;
        if (wpm is >= 110 and <= 165)
        {
            pacingScore = 95;
            strengths.Add($"Executive-level conversational cadence at {Math.Round(wpm)} words per minute.");
        }
        else if (wpm is >= 90 and < 110 or > 165 and <= 190)
        {
            pacingScore = 80;
        }
        else
        {
            pacingScore = 60;
            improvements.Add($"Cadence was {Math.Round(wpm)} WPM. Strive for controlled, authoritative pacing between 110-160 WPM.");
        }

        if (fillerCount > 5)
        {
            pacingScore -= Math.Min(15, fillerCount * 2);
            improvements.Add($"Detected {fillerCount} filler words. Keep pauses silent to project senior confidence.");
        }

        pacingScore = Math.Clamp(pacingScore, 25, 100);

        // 3. Sentence Structure: Coverage of all 3 scenarios (Standup + Debate + 1-on-1)
        var hasStandup = Regex.IsMatch(transcript, @"\b(yesterday|today|blocker|standup|update)\b", RegexOptions.IgnoreCase);
        var hasDebate = Regex.IsMatch(transcript, @"\b(architecture|debate|trade-off|monolith|microservices|consistency|blast radius|alternative)\b", RegexOptions.IgnoreCase);
        var hasSync = Regex.IsMatch(transcript, @"\b(1-on-1|one-on-one|career|growth|feedback|roadmap|bandwidth|priority|alignment)\b", RegexOptions.IgnoreCase);

        var scenarioHits = (hasStandup ? 1 : 0) + (hasDebate ? 1 : 0) + (hasSync ? 1 : 0);
        var structureScore = scenarioHits switch
        {
            3 => 95,
            2 => 75,
            1 => 55,
            _ => 35
        };

        if (scenarioHits == 3)
        {
            strengths.Add("Masterful context-switching covering Standup, Architectural Debate, and 1-on-1 Sync.");
        }
        else
        {
            improvements.Add($"Covered {scenarioHits}/3 required scenarios. Ensure coverage of: Standup + Architecture Debate + 1-on-1 Sync.");
        }

        // 4. Senior Leadership Vocabulary
        var seniorHits = Day90SeniorVocab.Count(p => transcript.Contains(p, StringComparison.OrdinalIgnoreCase) || words.Contains(p));
        var vocabScore = 50 + Math.Min(45, seniorHits * 10);
        vocabScore = Math.Clamp(vocabScore, 25, 100);

        if (seniorHits >= 3)
        {
            strengths.Add($"High-leverage staff/principal vocabulary ({seniorHits} strategic concepts applied).");
        }
        else
        {
            improvements.Add("Incorporate staff-level concepts like 'blast radius', 'eventual consistency', 'SLA/SLO', and 'idempotency'.");
        }

        var overallScore = (int)Math.Round((phoneticScore + pacingScore + structureScore + vocabScore) / 4.0);
        var passed = overallScore >= 70;

        var feedback = passed
            ? $"Day 90 Master Capstone Passed ({overallScore}/100)! Comprehensive technical, diplomatic, and executive fluency demonstrated."
            : $"Day 90 Master Capstone Not Passed ({overallScore}/100). Ensure comprehensive coverage of all 3 scenarios with strategic executive vocabulary.";

        return new CapstoneScorecard(
            OverallScore: overallScore,
            PhoneticScore: phoneticScore,
            FluencyPacingScore: pacingScore,
            SentenceStructureScore: structureScore,
            TechnicalVocabScore: vocabScore,
            Passed: passed,
            RubricFeedback: feedback,
            Strengths: strengths,
            Improvements: improvements
        );
    }
}
