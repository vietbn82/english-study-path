using FluentAssertions;

namespace DevEngCoach.Tests;

[Collection("ConsoleTests")]
public sealed class DevEngCliTests
{
    private static readonly SemaphoreSlim ConsoleLock = new(1, 1);

    private static async Task<(int ExitCode, string StdOut, string StdErr)> InvokeCliAsync(params string[] args)
    {
        await ConsoleLock.WaitAsync();
        var originalOut = Console.Out;
        var originalErr = Console.Error;

        await using var outWriter = new StringWriter();
        await using var errWriter = new StringWriter();

        try
        {
            Console.SetOut(outWriter);
            Console.SetError(errWriter);

            var exitCode = await DevEngCli.Program.Main(args);
            await outWriter.FlushAsync();
            await errWriter.FlushAsync();

            return (exitCode, outWriter.ToString(), errWriter.ToString());
        }
        finally
        {
            Console.SetOut(originalOut);
            Console.SetError(originalErr);
            ConsoleLock.Release();
        }
    }

    [Fact]
    public async Task Main_StatusCommand_ReturnsZeroAndOutputsStreakAndCompleted()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), $"deveng_cli_status_{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempDir);

        try
        {
            await File.WriteAllTextAsync(
                Path.Combine(tempDir, "progress_log.json"),
                """
                {
                  "sessions": [
                    { "day": 1, "status": "Completed", "actualMinutes": 30 },
                    { "day": 2, "status": "CompletedPartial", "actualMinutes": 10 }
                  ]
                }
                """);

            var (exitCode, stdOut, _) = await InvokeCliAsync("status", "--data-dir", tempDir);

            exitCode.Should().Be(0);
            stdOut.Should().Contain("Day:");
            stdOut.Should().Contain("Streak:");
            stdOut.Should().Contain("Completed:");
            stdOut.Should().Contain("2/90");
            stdOut.Should().Contain("SRS Due:");
        }
        finally
        {
            if (Directory.Exists(tempDir))
            {
                Directory.Delete(tempDir, recursive: true);
            }
        }
    }

    [Fact]
    public async Task Main_LookupCommand_WithValidTerm_ReturnsZeroAndOutputsIpaAndExample()
    {
        var (exitCode, stdOut, _) = await InvokeCliAsync("lookup", "idempotent");

        exitCode.Should().Be(0);
        stdOut.Should().Contain("idempotent");
        stdOut.Should().Contain("/aɪˈdɛm.pə.tənt/");
        stdOut.Should().Contain("webhook handler must be idempotent");
    }

    [Fact]
    public async Task Main_LookupCommand_WithMissingTerm_ReturnsOne()
    {
        var (exitCode, _, stdErr) = await InvokeCliAsync("lookup");

        exitCode.Should().Be(1);
        stdErr.Should().Contain("Usage: deveng lookup <term>");
    }

    [Fact]
    public async Task Main_ReviewCommand_WithOnceFlag_ReturnsZeroAndOutputsReviewSummary()
    {
        var (exitCode, stdOut, _) = await InvokeCliAsync("review", "--once");

        exitCode.Should().Be(0);
        stdOut.Should().Contain("Card 1/");
        stdOut.Should().Contain("IPA:");
        stdOut.Should().Contain("Meaning (VI):");
        stdOut.Should().Contain("Review complete!");
    }

    [Fact]
    public async Task Main_WarmupCommand_ReturnsZero()
    {
        var (exitCode, stdOut, _) = await InvokeCliAsync("warmup");

        exitCode.Should().Be(0);
        stdOut.Should().Contain("Warmup");
    }

    [Fact]
    public async Task Main_PrAndCommitCommands_ReturnZero()
    {
        var (prExit, prOut, _) = await InvokeCliAsync("pr", "this query is slow please add index");
        prExit.Should().Be(0);
        prOut.Should().Contain("Polished Feedback");

        var (commitExit, commitOut, _) = await InvokeCliAsync("commit", "fix bug in token refresh");
        commitExit.Should().Be(0);
        commitOut.Should().Contain("Conventional Commit");
    }
}
