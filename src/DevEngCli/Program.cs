using System.Text.Json;
using DevEngCoach.Common;
using DevEngCoach.Services;

namespace DevEngCli;

public static class Program
{
    public sealed record DevTermEntry(
        string Term,
        string Ipa,
        string VietnameseMeaning,
        string ExampleSentence,
        string ArticulatoryCue);

    private static readonly IReadOnlyList<DevTermEntry> BuiltInGlossary =
    [
        new(
            "idempotent",
            "/aɪˈdɛm.pə.tənt/",
            "Thực thi nhiều lần vẫn cho cùng một kết quả như thực thi một lần (Bất biến kết quả).",
            "Our payment webhook handler must be idempotent so duplicate retries do not charge the customer twice.",
            "Stress 2nd syllable 'dem', release crisp /t/ coda at alveolar ridge."),
        new(
            "latency",
            "/ˈleɪ.tən.si/",
            "Độ trễ phản hồi của hệ thống hoặc mạng.",
            "We reduced p99 API latency by caching frequently accessed user profiles in Redis.",
            "Stress 1st syllable 'lay' (/leɪ/), clear alveolar /t/ and tense final /i/."),
        new(
            "throughput",
            "/ˈθruː.pʊt/",
            "Lưu lượng xử lý trong một đơn vị thời gian.",
            "Batching database writes significantly increased our event ingestion throughput.",
            "Unvoiced dental fricative /θ/ at start, crisp /t/ stop at finish."),
        new(
            "deadlock",
            "/ˈdɛd.lɒk/",
            "Khoá chết (hai hay nhiều tiến trình chờ tài nguyên của nhau).",
            "Acquiring locks in a consistent global order prevents database deadlocks under high load.",
            "Hold voiced /d/ briefly before transitioning to /l/, release sharp /k/ coda."),
        new(
            "bottleneck",
            "/ˈbɒt.əl.nɛk/",
            "Điểm nghẽn hiệu năng của hệ thống.",
            "Profiling revealed that synchronous JSON serialization was the primary CPU bottleneck.",
            "Syllabic /l/ in the middle, crisp unvoiced velar /k/ coda."),
        new(
            "race condition",
            "/ˈreɪs kənˌdɪʃ.ən/",
            "Điều kiện tranh chấp dữ liệu do thứ tự thực thi bất định.",
            "Using an atomic compare-and-swap operation eliminated the race condition in token refresh.",
            "Clear /s/ sibilant in 'race', palatal /ʃ/ in 'condition'."),
        new(
            "payload",
            "/ˈpeɪ.loʊd/",
            "Dữ liệu tải thực tế được truyền trong bản tin request/response.",
            "Compressing the JSON payload with Brotli cut bandwidth usage by sixty percent.",
            "Diphthong /eɪ/ into /oʊ/, finish with voiced alveolar /d/."),
        new(
            "middleware",
            "/ˈmɪd.əl.wɛər/",
            "Lớp trung gian xử lý request/response trong pipeline.",
            "We registered a custom authentication middleware to validate JWT bearer tokens.",
            "Primary stress on 'mid', smooth transition into 'ware'."),
        new(
            "deprecation",
            "/ˌdɛp.rɪˈkeɪ.ʃən/",
            "Ngừng khuyến khích sử dụng để chuẩn bị loại bỏ tính năng hoặc API cũ.",
            "We announced the deprecation of the v1 endpoint two quarters before removing it.",
            "Primary stress on 3rd syllable 'kay' (/keɪ/), soft /ʃən/ ending."),
        new(
            "orchestration",
            "/ˌɔːr.kɪˈstreɪ.ʃən/",
            "Điều phối tập trung các dịch vụ hoặc container.",
            "Kubernetes handles container orchestration, automated rollouts, and self-healing.",
            "Pronounce 'ch' as hard /k/, stress 'stray' (/streɪ/)."),
        new(
            "asynchronous",
            "/eɪˈsɪŋ.krə.nəs/",
            "Bất đồng bộ (không chặn luồng thực thi chính khi chờ I/O).",
            "Moving report generation to an asynchronous background worker kept the UI responsive.",
            "Start with /eɪ/, primary stress on 'sin' (/ˈsɪŋ/), finish with clear /s/."),
        new(
            "concurrency",
            "/kənˈkɜːr.ən.si/",
            "Xử lý đồng thời nhiều tác vụ trong cùng khoảng thời gian.",
            "Optimistic concurrency control uses row version tokens to detect conflicting updates.",
            "Unstressed schwa in 1st syllable /kən/, strong stress on 2nd syllable /ˈkɜːr/."),
        new(
            "serialization",
            "/ˌsɪər.i.ə.laɪˈzeɪ.ʃən/",
            "Tuần tự hoá đối tượng thành chuỗi byte hoặc văn bản (JSON/Protobuf).",
            "Source-generated JSON serialization in .NET reduces reflection overhead and startup time.",
            "Primary stress on 'zay' (/ˈzeɪ/), voiced /z/ before /eɪ/."),
        new(
            "immutable",
            "/ɪˈmjuː.tə.bəl/",
            "Bất biến (không thể thay đổi trạng thái sau khi khởi tạo).",
            "Using immutable record types makes concurrent state sharing inherently thread-safe.",
            "Stress 2nd syllable 'myoo' (/ˈmjuː/), dark /l/ at the end."),
        new(
            "pagination",
            "/ˌpædʒ.ɪˈneɪ.ʃən/",
            "Phân trang dữ liệu trả về từ truy vấn hoặc API.",
            "Cursor-based pagination performs much better than offset pagination on large tables.",
            "Voiced affricate /dʒ/ in 'pag-', primary stress on 'nay' (/ˈneɪ/)."),
        new(
            "authentication",
            "/ɔːˌθɛn.tɪˈkeɪ.ʃən/",
            "Xác thực danh tính người dùng hoặc dịch vụ.",
            "We centralized authentication at the API gateway using OAuth 2.0 and OpenID Connect.",
            "Unvoiced dental /θ/ in 'auth', primary stress on 'kay' (/ˈkeɪ/).")
    ];

    public static async Task<int> Main(string[] args)
    {
        try
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
        }
        catch (IOException)
        {
            // Ignore when running inside redirected non-console test hosts.
        }

        if (args.Length == 0 || IsHelpArg(args[0]))
        {
            ShowHelp();
            return 0;
        }

        var command = args[0].ToLowerInvariant();
        var remainingArgs = args.Skip(1).ToArray();

        return command switch
        {
            "status" => RunStatus(args),
            "lookup" => RunLookup(args),
            "review" => RunReview(args),
            "pr" => await HandlePrCommandAsync(remainingArgs),
            "commit" => await HandleCommitCommandAsync(remainingArgs),
            "standup" => HandleStandupCommand(remainingArgs),
            "warmup" => HandleWarmupCommand(),
            _ => HandleUnknownCommand(command)
        };
    }

    private static bool IsHelpArg(string arg) =>
        arg is "--help" or "-h" or "help" or "/?" or "-?";

    private static void ShowHelp()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("===============================================================");
        Console.WriteLine(" 🚀 DevEngCoach Terminal CLI - Senior Dev Communication Suite ");
        Console.WriteLine("===============================================================");
        Console.ResetColor();
        Console.WriteLine();
        Console.WriteLine("Usage: deveng <command> [arguments]");
        Console.WriteLine();
        Console.WriteLine("Commands:");
        PrintCommandHelp("status", "Display 90-day streak, completed days, and SRS due card summary.");
        PrintCommandHelp("lookup <term>", "Look up developer term IPA, Vietnamese meaning, and senior dev example.");
        PrintCommandHelp("review [--once]", "Run SRS flashcard review in the terminal (--once for quick non-interactive run).");
        PrintCommandHelp("pr <comment>", "Polish raw or blunt PR comments into diplomatic senior review feedback.");
        PrintCommandHelp("commit <message>", "Format informal commit messages into Conventional Commits with scope.");
        PrintCommandHelp("standup", "Generate quick daily standup template with phonetic & articulatory cues.");
        PrintCommandHelp("warmup", "Run today's 2-minute articulatory drill for dev pronunciation.");
        PrintCommandHelp("--help, -h", "Show this help screen.");
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("Examples:");
        Console.WriteLine("  deveng status");
        Console.WriteLine("  deveng lookup idempotent");
        Console.WriteLine("  deveng review --once");
        Console.WriteLine("  deveng pr \"this code slow fix it\"");
        Console.WriteLine("  deveng pr --tone DiplomaticPushback \"we should not merge this\"");
        Console.WriteLine("  deveng commit \"fix bug login\"");
        Console.WriteLine("  deveng standup");
        Console.WriteLine("  deveng warmup");
        Console.ResetColor();
    }

    private static void PrintCommandHelp(string cmd, string desc)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write($"  {cmd.PadRight(22)}");
        Console.ResetColor();
        Console.WriteLine(desc);
    }

    private static async Task<int> HandlePrCommandAsync(string[] args)
    {
        var polisher = new PrPolisherService();
        var tone = PrPolishTones.ConstructiveReview;
        string? codeContext = null;
        var textParts = new List<string>();

        for (var i = 0; i < args.Length; i++)
        {
            var arg = args[i];
            if (arg is "--tone" or "-t" && i + 1 < args.Length)
            {
                tone = args[++i];
            }
            else if (arg is "--context" or "-c" && i + 1 < args.Length)
            {
                codeContext = args[++i];
            }
            else
            {
                textParts.Add(arg);
            }
        }

        var inputText = string.Join(" ", textParts).Trim();
        if (string.IsNullOrWhiteSpace(inputText))
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write("Enter PR review comment to polish: ");
            Console.ResetColor();
            inputText = Console.ReadLine()?.Trim() ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(inputText))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Error: No comment provided.");
            Console.ResetColor();
            return 1;
        }

        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"🔍 Polishing review comment [Tone: {tone}]...");
        Console.ResetColor();

        var request = new PrPolishRequest(inputText, tone, codeContext);
        var response = await polisher.PolishAsync(request);

        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("✨ Polished Feedback:");
        Console.ForegroundColor = ConsoleColor.White;
        Console.WriteLine($"   \"{response.PolishedText}\"");
        Console.WriteLine();

        if (!string.IsNullOrWhiteSpace(response.AlternativeDraft))
        {
            Console.ForegroundColor = ConsoleColor.DarkCyan;
            Console.WriteLine("📝 Alternative Draft:");
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.WriteLine($"   \"{response.AlternativeDraft}\"");
            Console.WriteLine();
        }

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("💡 Senior Engineer Rationale:");
        Console.ResetColor();
        Console.WriteLine($"   {response.Explanation}");
        Console.WriteLine();

        if (response.KeyPhrasesUsed.Count > 0)
        {
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine("🔑 Key Phrases & Idioms:");
            Console.ResetColor();
            foreach (var phrase in response.KeyPhrasesUsed)
            {
                Console.WriteLine($"   • {phrase}");
            }
            Console.WriteLine();
        }

        if (response.AvoidedAntiPatterns.Count > 0)
        {
            Console.ForegroundColor = ConsoleColor.DarkYellow;
            Console.WriteLine("🛡️ Avoided Anti-Patterns:");
            Console.ResetColor();
            foreach (var anti in response.AvoidedAntiPatterns)
            {
                Console.WriteLine($"   ✓ Avoided: {anti}");
            }
            Console.WriteLine();
        }

        return 0;
    }

    private static async Task<int> HandleCommitCommandAsync(string[] args)
    {
        var polisher = new PrPolisherService();
        var rawMessage = string.Join(" ", args).Trim();

        if (string.IsNullOrWhiteSpace(rawMessage))
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write("Enter draft commit message: ");
            Console.ResetColor();
            rawMessage = Console.ReadLine()?.Trim() ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(rawMessage))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Error: No commit message provided.");
            Console.ResetColor();
            return 1;
        }

        var request = new PrPolishRequest(rawMessage, PrPolishTones.CommitMessage);
        var response = await polisher.PolishAsync(request);

        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("📦 Conventional Commit:");
        Console.ForegroundColor = ConsoleColor.White;
        Console.WriteLine($"   {response.PolishedText}");
        Console.WriteLine();

        if (!string.IsNullOrWhiteSpace(response.AlternativeDraft))
        {
            Console.ForegroundColor = ConsoleColor.DarkCyan;
            Console.WriteLine("📝 Alternative Commit:");
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.WriteLine($"   {response.AlternativeDraft}");
            Console.WriteLine();
        }

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("💡 Scope & Intent:");
        Console.ResetColor();
        Console.WriteLine($"   {response.Explanation}");
        Console.WriteLine();

        return 0;
    }

    private static int HandleStandupCommand(string[] args)
    {
        var isInteractive = args.Any(a => a is "--interactive" or "-i");

        if (isInteractive)
        {
            return RunInteractiveStandup();
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("===============================================================");
        Console.WriteLine(" 🎙️ Quick Daily Standup Template (With Pronunciation Cues)     ");
        Console.WriteLine("===============================================================");
        Console.ResetColor();
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("🕒 Yesterday:");
        Console.ResetColor();
        Console.WriteLine("   \"Yesterday I investigated a latency bottleneck in the authentication pipeline and refactored the token caching layer.\"");
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("   [Cues]: 'investigated' /ɪnˈvɛs.tɪ.ɡeɪ.tɪd/ (stress -gai-, clear -tid coda)");
        Console.WriteLine("           'bottleneck' /ˈbɒt.əl.nɛk/ (crisp /t/ tap, stop /k/)");
        Console.WriteLine("           'refactored' /ˌriːˈfæk.tərd/ (voiced /d/ coda, avoid dropping)");
        Console.ResetColor();
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("🚀 Today:");
        Console.ResetColor();
        Console.WriteLine("   \"Today I'm implementing idempotent retry logic for the message consumer and adding unit test coverage.\"");
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("   [Cues]: 'idempotent' /aɪˈdɛm.pə.tənt/ (stress 2nd syllable 'dem', sharp /t/ coda)");
        Console.WriteLine("           'implementing' /ˈɪm.plɪ.mɛn.tɪŋ/ (clean plosive /p/, nasal /ŋ/)");
        Console.WriteLine("           'consumer' /kənˈsjuː.mər/ (smooth glide)");
        Console.ResetColor();
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("⚠️ Blockers & Dependencies:");
        Console.ResetColor();
        Console.WriteLine("   \"No blocking issues; I'd like a quick pairing session with DevOps to verify cluster failover behavior.\"");
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("   [Cues]: 'pairing' /ˈpeə.rɪŋ/ (smooth diphthong)");
        Console.WriteLine("           'failover' /ˈfeɪlˌoʊ.vər/ (voiced /v/ friction, clean /l/)");
        Console.ResetColor();
        Console.WriteLine();

        return 0;
    }

    private static int RunInteractiveStandup()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("📝 Interactive Daily Standup Builder");
        Console.WriteLine("=====================================");
        Console.ResetColor();

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write("What did you complete yesterday? ");
        Console.ResetColor();
        var yesterday = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(yesterday)) yesterday = "Investigated authentication pipeline performance.";

        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write("What are you working on today? ");
        Console.ResetColor();
        var today = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(today)) today = "Implementing retry logic and telemetry.";

        Console.ForegroundColor = ConsoleColor.Red;
        Console.Write("Any blockers or cross-team sync needed? ");
        Console.ResetColor();
        var blockers = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(blockers)) blockers = "No blockers.";

        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("📢 Your Polished Standup Speech:");
        Console.ResetColor();
        Console.WriteLine($"• Yesterday: Yesterday I {yesterday.TrimEnd('.')}.");
        Console.WriteLine($"• Today: Today I am focusing on {today.TrimEnd('.')}.");
        Console.WriteLine($"• Blockers: {(blockers.StartsWith("no", StringComparison.OrdinalIgnoreCase) ? blockers : $"I have a dependency on {blockers.TrimEnd('.')}")}.");
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("Tip: Speak in deliberate phrases, pause at commas, and pronounce all word-final consonants.");
        Console.ResetColor();

        return 0;
    }

    private static int HandleWarmupCommand()
    {
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine("===============================================================");
        Console.WriteLine(" ⚡ Today's 2-Minute Articulatory Vocal Warmup for Devs       ");
        Console.WriteLine("===============================================================");
        Console.ResetColor();
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("🎯 Target Sound Focus: Consonant Codas & Stops (/t/, /d/, /θ/, /ð/)");
        Console.ResetColor();
        Console.WriteLine("   Mechanical Rule: Hold air pressure behind the alveolar ridge, then release");
        Console.WriteLine("   with a distinct acoustic burst. Never swallow final consonants in tech terms.");
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("🔬 5 Rapid Articulatory Drills (Say each aloud 3x):");
        Console.ResetColor();
        PrintDrill("1. commit", "/kəˈmɪt/", "Stop /t/ at alveolar ridge. Crisp release, do not drop.");
        PrintDrill("2. thread", "/θrɛd/", "Tongue tip between front teeth for /θ/, voiced stop /d/ at coda.");
        PrintDrill("3. throughput", "/ˈθruː.pʊt/", "Dental fricative /θ/ -> unvoiced /t/ at finish.");
        PrintDrill("4. architecture", "/ˈɑːr.kɪ.tɛk.tʃər/", "Clear /k/ velar stop transitioning cleanly into /tʃ/.");
        PrintDrill("5. deadlock", "/ˈdɛd.lɒk/", "Voiced /d/ stop -> unvoiced /k/ coda.");
        Console.WriteLine();

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("🗣️ 10-Second Senior Dev Fluidity Challenge:");
        Console.ResetColor();
        Console.WriteLine("   \"We deployed the updated build and verified that the background thread doesn't deadlock.\"");
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("   (Pacing: 120 WPM, breath anchor before 'and verified', clear /t/ in 'doesn't')");
        Console.ResetColor();
        Console.WriteLine();

        return 0;
    }

    private static void PrintDrill(string word, string ipa, string note)
    {
        Console.ForegroundColor = ConsoleColor.White;
        Console.Write($"   {word.PadRight(18)}");
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.Write($"{ipa.PadRight(20)}");
        Console.ForegroundColor = ConsoleColor.Gray;
        Console.WriteLine(note);
        Console.ResetColor();
    }

    private static int HandleUnknownCommand(string command)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"Unknown command: '{command}'");
        Console.ResetColor();
        Console.WriteLine("Run 'deveng --help' to inspect available commands.");
        return 1;
    }

    public static string ResolveDataDirectory(string[] args)
    {
        for (var i = 0; i < args.Length; i++)
        {
            if (string.Equals(args[i], "--data-dir", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                return args[i + 1];
            }

            if (args[i].StartsWith("--data-dir=", StringComparison.OrdinalIgnoreCase))
            {
                return args[i]["--data-dir=".Length..].Trim('"');
            }
        }

        var probeRoots = new[]
        {
            AppContext.BaseDirectory,
            Directory.GetCurrentDirectory()
        };

        foreach (var root in probeRoots)
        {
            if (string.IsNullOrWhiteSpace(root))
            {
                continue;
            }

            var current = new DirectoryInfo(root);
            while (current is not null)
            {
                var devEngData = Path.Combine(current.FullName, "src", "DevEngCoach", "Data");
                if (Directory.Exists(devEngData))
                {
                    return devEngData;
                }

                var localData = Path.Combine(current.FullName, "Data");
                if (File.Exists(Path.Combine(localData, "progress_log.json")) || Directory.Exists(localData))
                {
                    return localData;
                }

                current = current.Parent;
            }
        }

        return Path.Combine(Directory.GetCurrentDirectory(), "Data");
    }

    public static int RunStatus(string[] args)
    {
        var dataDir = ResolveDataDirectory(args);
        var currentDay = 1;
        var streak = 0;
        var completedCount = 0;
        var totalDays = 90;
        var totalMinutes = 0;
        var srsDueCount = 0;

        var progressPath = Path.Combine(dataDir, "progress_log.json");
        if (File.Exists(progressPath))
        {
            try
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(progressPath));
                var root = doc.RootElement;

                if (root.ValueKind == JsonValueKind.Object)
                {
                    if (TryGetIntProperty(root, "currentStreak", out var topStreak))
                    {
                        streak = topStreak;
                    }

                    if (TryGetIntProperty(root, "currentDay", out var topDay) && topDay > 0)
                    {
                        currentDay = topDay;
                    }
                }

                if (TryGetArrayElement(root, ["sessions", "days", "entries"], out var sessionsElement))
                {
                    var completedDaysSet = new SortedSet<int>();
                    foreach (var item in sessionsElement.EnumerateArray())
                    {
                        if (item.ValueKind != JsonValueKind.Object)
                        {
                            continue;
                        }

                        var status = GetStringProperty(item, ["status", "state"]) ?? string.Empty;
                        var dayNum = GetIntProperty(item, ["day", "dayNumber"], 0);
                        var minutes = GetIntProperty(item, ["actualMinutes", "minutes"], 0);
                        totalMinutes += minutes;

                        if (status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
                            status.Equals("CompletedPartial", StringComparison.OrdinalIgnoreCase))
                        {
                            completedCount++;
                            if (dayNum > 0)
                            {
                                completedDaysSet.Add(dayNum);
                            }
                        }
                    }

                    if (completedDaysSet.Count > 0)
                    {
                        var maxDay = completedDaysSet.Max;
                        if (currentDay == 1)
                        {
                            currentDay = Math.Clamp(maxDay + 1, 1, totalDays);
                        }

                        if (streak == 0)
                        {
                            var cursor = maxDay;
                            while (completedDaysSet.Contains(cursor))
                            {
                                streak++;
                                cursor--;
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Keep graceful defaults when progress_log.json is malformed.
            }
        }

        var srsPath = Path.Combine(dataDir, "srs_deck.json");
        if (File.Exists(srsPath))
        {
            try
            {
                using var doc = JsonDocument.Parse(File.ReadAllText(srsPath));
                if (TryGetArrayElement(doc.RootElement, ["items", "cards", "deck"], out var cardsElement))
                {
                    var now = DateTimeOffset.UtcNow;
                    foreach (var card in cardsElement.EnumerateArray())
                    {
                        if (card.ValueKind != JsonValueKind.Object)
                        {
                            continue;
                        }

                        var nextReviewRaw = GetStringProperty(card, ["nextReviewDate", "dueDate", "nextReview"]);
                        if (string.IsNullOrWhiteSpace(nextReviewRaw) ||
                            !DateTimeOffset.TryParse(nextReviewRaw, out var nextReview) ||
                            nextReview <= now.AddMinutes(5))
                        {
                            srsDueCount++;
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Keep graceful defaults when srs_deck.json is malformed.
            }
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("===============================================================");
        Console.WriteLine(" 📊 DevEngCoach 90-Day Training Status                         ");
        Console.WriteLine("===============================================================");
        Console.ResetColor();
        Console.WriteLine($"  Day:          Day {currentDay} of {totalDays}");
        Console.WriteLine($"  Streak:       {streak} day(s) 🔥");
        Console.WriteLine($"  Completed:    {completedCount}/{totalDays} days ({totalMinutes} mins logged)");
        Console.WriteLine($"  SRS Due:      {srsDueCount} card(s) ready for review");
        Console.WriteLine();

        return 0;
    }

    public static int RunLookup(string[] args)
    {
        var queryParts = new List<string>();
        for (var i = 1; i < args.Length; i++)
        {
            var arg = args[i];
            if (string.Equals(arg, "--data-dir", StringComparison.OrdinalIgnoreCase))
            {
                i++; // Skip the directory value
                continue;
            }

            if (arg.StartsWith("--", StringComparison.Ordinal))
            {
                continue;
            }

            queryParts.Add(arg);
        }

        var term = string.Join(" ", queryParts).Trim();
        if (string.IsNullOrWhiteSpace(term))
        {
            Console.Error.WriteLine("Error: Missing search term. Usage: deveng lookup <term>");
            Console.WriteLine("Error: Missing search term. Usage: deveng lookup <term>");
            return 1;
        }

        var matches = BuiltInGlossary
            .Where(entry =>
                entry.Term.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                entry.VietnameseMeaning.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                entry.ExampleSentence.Contains(term, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var dataDir = ResolveDataDirectory(args);
        if (Directory.Exists(dataDir))
        {
            foreach (var file in Directory.EnumerateFiles(dataDir, "curriculum_*.json"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(File.ReadAllText(file));
                    ScanJsonForCurriculumTerms(doc.RootElement, term, matches);
                }
                catch (Exception)
                {
                    // Ignore malformed curriculum files during CLI lookup.
                }
            }
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"🔎 Developer Glossary Lookup: \"{term}\"");
        Console.WriteLine("---------------------------------------------------------------");
        Console.ResetColor();

        if (matches.Count == 0)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"No exact glossary entry found for '{term}'.");
            Console.ResetColor();
            Console.WriteLine("Tip: Try core engineering terms such as 'idempotent', 'latency', 'throughput', 'deadlock', or 'concurrency'.");
            return 0;
        }

        foreach (var entry in matches)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write($"  • {entry.Term} ");
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine(entry.Ipa);
            Console.ResetColor();
            Console.WriteLine($"    Meaning (VI):     {entry.VietnameseMeaning}");
            Console.WriteLine($"    Articulatory Cue: {entry.ArticulatoryCue}");
            Console.WriteLine($"    Senior Example:   \"{entry.ExampleSentence}\"");
            Console.WriteLine();
        }

        return 0;
    }

    public static int RunReview(string[] args)
    {
        var runOnce = args.Any(a =>
            string.Equals(a, "--once", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(a, "--non-interactive", StringComparison.OrdinalIgnoreCase))
            || Console.IsInputRedirected;

        var dataDir = ResolveDataDirectory(args);
        var cards = LoadDueReviewCards(dataDir);
        if (cards.Count == 0)
        {
            cards = BuiltInGlossary
                .Where(g => g.Term is "asynchronous" or "idempotent" or "concurrency")
                .ToList();
        }

        var cardsToReview = cards.Take(3).ToList();

        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine("===============================================================");
        Console.WriteLine(" 🧠 DevEngCoach Terminal SRS Flashcard Review                  ");
        Console.WriteLine("===============================================================");
        Console.ResetColor();
        Console.WriteLine();

        for (var i = 0; i < cardsToReview.Count; i++)
        {
            var card = cardsToReview[i];
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Card {i + 1}/{cardsToReview.Count}: {card.Term}");
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"  IPA:              {card.Ipa}");
            Console.ResetColor();

            if (!runOnce)
            {
                Console.ForegroundColor = ConsoleColor.DarkGray;
                Console.Write("  [Press Enter to reveal meaning & example...] ");
                Console.ResetColor();
                Console.ReadLine();
            }

            Console.WriteLine($"  Meaning (VI):     {card.VietnameseMeaning}");
            Console.WriteLine($"  Articulatory Cue: {card.ArticulatoryCue}");
            Console.WriteLine($"  Example:          \"{card.ExampleSentence}\"");
            Console.WriteLine();
        }

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"✅ Review complete! Reviewed {cardsToReview.Count} card(s).");
        Console.ResetColor();
        return 0;
    }

    private static List<DevTermEntry> LoadDueReviewCards(string dataDir)
    {
        var results = new List<DevTermEntry>();
        var srsPath = Path.Combine(dataDir, "srs_deck.json");
        if (!File.Exists(srsPath))
        {
            return results;
        }

        try
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(srsPath));
            if (!TryGetArrayElement(doc.RootElement, ["items", "cards", "deck"], out var cardsElement))
            {
                return results;
            }

            var now = DateTimeOffset.UtcNow;
            foreach (var item in cardsElement.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                var nextReviewRaw = GetStringProperty(item, ["nextReviewDate", "dueDate", "nextReview"]);
                if (!string.IsNullOrWhiteSpace(nextReviewRaw) &&
                    DateTimeOffset.TryParse(nextReviewRaw, out var nextReview) &&
                    nextReview > now.AddMinutes(5))
                {
                    continue;
                }

                var term = GetStringProperty(item, ["word", "term", "targetWord"]);
                if (string.IsNullOrWhiteSpace(term))
                {
                    continue;
                }

                var builtIn = BuiltInGlossary.FirstOrDefault(
                    b => b.Term.Equals(term, StringComparison.OrdinalIgnoreCase));

                var ipa = GetStringProperty(item, ["ipa", "phonetic", "targetIpa"])
                          ?? builtIn?.Ipa
                          ?? "/.../";
                var meaning = GetStringProperty(item, ["vietnameseMeaning", "meaning", "hint"])
                              ?? builtIn?.VietnameseMeaning
                              ?? "Từ vựng kỹ thuật phần mềm trọng tâm.";
                var example = GetStringProperty(item, ["exampleSentence", "example", "contextSentence"])
                              ?? builtIn?.ExampleSentence
                              ?? $"We verified {term} behavior during code review.";
                var cue = GetStringProperty(item, ["physicalCue", "articulatoryCue", "mouthCue"])
                          ?? builtIn?.ArticulatoryCue
                          ?? "Enunciate stressed syllable and final consonant clearly.";

                results.Add(new DevTermEntry(term, ipa, meaning, example, cue));
            }
        }
        catch (Exception)
        {
            // Fall back to built-in cards if JSON cannot be read.
        }

        return results;
    }

    private static void ScanJsonForCurriculumTerms(
        JsonElement element,
        string searchTerm,
        List<DevTermEntry> matches)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
            {
                var word = GetStringProperty(element, ["word", "term", "targetWord", "keyPhrase"]);
                var ipa = GetStringProperty(element, ["ipa", "phonetic", "targetIpa"]);
                if (!string.IsNullOrWhiteSpace(word) &&
                    word.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) &&
                    matches.All(m => !m.Term.Equals(word, StringComparison.OrdinalIgnoreCase)))
                {
                    var meaning = GetStringProperty(element, ["vietnameseMeaning", "meaning", "vietnameseHint", "explanation"])
                                  ?? "Thuật ngữ trong giáo trình luyện nói 90 ngày.";
                    var example = GetStringProperty(element, ["exampleSentence", "example", "sentence", "templatePattern"])
                                  ?? $"Let's discuss {word} in today's architecture sync.";
                    var cue = GetStringProperty(element, ["physicalCue", "articulatoryCue", "mouthCue", "tip"])
                              ?? "Keep clear syllable stress and crisp final consonant.";
                    matches.Add(new DevTermEntry(word, ipa ?? "/.../", meaning, example, cue));
                }

                foreach (var prop in element.EnumerateObject())
                {
                    ScanJsonForCurriculumTerms(prop.Value, searchTerm, matches);
                }

                break;
            }
            case JsonValueKind.Array:
            {
                foreach (var item in element.EnumerateArray())
                {
                    ScanJsonForCurriculumTerms(item, searchTerm, matches);
                }

                break;
            }
        }
    }

    private static bool TryGetArrayElement(JsonElement root, string[] candidateNames, out JsonElement arrayElement)
    {
        if (root.ValueKind == JsonValueKind.Array)
        {
            arrayElement = root;
            return true;
        }

        if (root.ValueKind == JsonValueKind.Object)
        {
            foreach (var prop in root.EnumerateObject())
            {
                if (prop.Value.ValueKind == JsonValueKind.Array &&
                    candidateNames.Any(n => string.Equals(n, prop.Name, StringComparison.OrdinalIgnoreCase)))
                {
                    arrayElement = prop.Value;
                    return true;
                }
            }
        }

        arrayElement = default;
        return false;
    }

    private static string? GetStringProperty(JsonElement obj, string[] candidateNames)
    {
        if (obj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        foreach (var prop in obj.EnumerateObject())
        {
            if (prop.Value.ValueKind == JsonValueKind.String &&
                candidateNames.Any(n => string.Equals(n, prop.Name, StringComparison.OrdinalIgnoreCase)))
            {
                return prop.Value.GetString();
            }
        }

        return null;
    }

    private static int GetIntProperty(JsonElement obj, string[] candidateNames, int defaultValue)
    {
        foreach (var name in candidateNames)
        {
            if (TryGetIntProperty(obj, name, out var val))
            {
                return val;
            }
        }

        return defaultValue;
    }

    private static bool TryGetIntProperty(JsonElement obj, string candidateName, out int value)
    {
        if (obj.ValueKind == JsonValueKind.Object)
        {
            foreach (var prop in obj.EnumerateObject())
            {
                if (string.Equals(prop.Name, candidateName, StringComparison.OrdinalIgnoreCase) &&
                    prop.Value.ValueKind == JsonValueKind.Number &&
                    prop.Value.TryGetInt32(out value))
                {
                    return true;
                }
            }
        }

        value = 0;
        return false;
    }
}
