using DevEngCoach.Common;
using DevEngCoach.Services;

namespace DevEngCli;

public static class Program
{
    public static async Task<int> Main(string[] args)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;

        if (args.Length == 0 || IsHelpArg(args[0]))
        {
            ShowHelp();
            return 0;
        }

        var command = args[0].ToLowerInvariant();
        var remainingArgs = args.Skip(1).ToArray();

        return command switch
        {
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
        PrintCommandHelp("pr <comment>", "Polish raw or blunt PR comments into diplomatic senior review feedback.");
        PrintCommandHelp("commit <message>", "Format informal commit messages into Conventional Commits with scope.");
        PrintCommandHelp("standup", "Generate quick daily standup template with phonetic & articulatory cues.");
        PrintCommandHelp("warmup", "Run today's 2-minute articulatory drill for dev pronunciation.");
        PrintCommandHelp("--help, -h", "Show this help screen.");
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("Examples:");
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
}
