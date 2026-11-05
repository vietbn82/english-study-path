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
}
