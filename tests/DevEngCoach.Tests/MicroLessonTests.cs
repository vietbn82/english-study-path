using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class MicroLessonTests : IDisposable
{
    private readonly string testDir;
    private readonly ProgressService progressService;

    public MicroLessonTests()
    {
        testDir = Path.Combine(Path.GetTempPath(), $"progress_micro_{Guid.NewGuid():N}");
        Directory.CreateDirectory(Path.Combine(testDir, "Data"));

        var env = new FakeWebHostEnvironment(testDir);
        progressService = new ProgressService(env);
    }

    public void Dispose()
    {
        try { if (Directory.Exists(testDir)) Directory.Delete(testDir, true); } catch { }
    }

    [Fact]
    public void MicroCompleteSession_ShouldMaintainStreakAndMarkPartial()
    {
        var request = new MicroSessionRequest(
            DayNumber: 1,
            SelectedBlock: "Phonetics",
            ActualMinutes: 10
        );

        var session = progressService.MicroCompleteSession(request);

        session.Status.Should().Be("CompletedPartial");
        session.ActualMinutes.Should().Be(10);

        var summary = progressService.GetSummary();
        summary.TotalCompletedDays.Should().Be(1);
        summary.CurrentStreakDays.Should().Be(1);
    }

    [Fact]
    public void GetRecommendation_ShouldReturnValidBlockSuggestion()
    {
        var rec = progressService.GetRecommendation();

        rec.Should().NotBeNull();
        rec.RecommendedBlock.Should().BeOneOf("Phonetics", "Frames", "Output");
        rec.ReasonVi.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void MicroCompleteSession_AllThreeBlocksCompleted_UpgradesStatusToCompleted()
    {
        progressService.MicroCompleteSession(new MicroSessionRequest(1, "Phonetics", 10));
        progressService.MicroCompleteSession(new MicroSessionRequest(1, "Frames", 10));
        var finalLog = progressService.MicroCompleteSession(new MicroSessionRequest(1, "Output", 10));

        finalLog.Status.Should().Be("Completed");
        finalLog.CompletionMode.Should().Be("MicroUpgraded");
        finalLog.ActualMinutes.Should().Be(30);
        finalLog.BlocksCompleted.Should().BeEquivalentTo(["Phonetics", "Frames", "Output"]);
        finalLog.CompletedBlock.Should().BeNull();
    }

    [Fact]
    public void GetRecommendation_AfterFiveConsecutivePartials_SetsShowConsecutivePartialNudgeTrue()
    {
        for (var day = 1; day <= 5; day++)
        {
            progressService.MicroCompleteSession(new MicroSessionRequest(day, "Phonetics", 10));
        }

        var rec = progressService.GetRecommendation();

        rec.ShowConsecutivePartialNudge.Should().BeTrue();
        rec.DaysSinceLastSpeaking.Should().BeGreaterThanOrEqualTo(2);
        rec.RecommendedBlock.Should().Be("Output");
    }

    [Fact]
    public void GetRecommendation_WithFiveSrsDueItems_PrioritizesPhonetics()
    {
        var srsPath = Path.Combine(testDir, "Data", "srs_micro_test.json");
        var srs = new SrsService(srsPath);
        for (var i = 1; i <= 5; i++)
        {
            srs.AutoEnrollWeakSpot(new SrsEnrollRequest($"word{i}", "/t/", $"Sentence {i}", 45));
        }

        var env = new FakeWebHostEnvironment(testDir);
        var serviceWithSrs = new ProgressService(env, srs);

        var rec = serviceWithSrs.GetRecommendation();

        rec.WeakSpotCount.Should().BeGreaterThanOrEqualTo(5);
        rec.RecommendedBlock.Should().Be("Phonetics");
    }
}
