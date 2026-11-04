using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;

namespace DevEngCoach.Tests;

public class ProgressServiceTests : IDisposable
{
    private readonly string _testDir;
    private readonly ProgressService _progressService;

    public ProgressServiceTests()
    {
        _testDir = Path.Combine(Path.GetTempPath(), "DevEngCoach_Test_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(_testDir, "Data"));

        var env = new FakeWebHostEnvironment(_testDir);
        _progressService = new ProgressService(env);
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_testDir))
            {
                Directory.Delete(_testDir, true);
            }
        }
        catch { }
    }

    [Fact]
    public void InitialSummary_ShouldHaveZeroCompletedDaysAndNextDay1()
    {
        var summary = _progressService.GetSummary();

        summary.TotalCompletedDays.Should().Be(0);
        summary.CurrentStreakDays.Should().Be(0);
        summary.NextDayNumber.Should().Be(1);
        summary.CompletionPercentage.Should().Be(0.0);
    }

    [Fact]
    public void CompleteSession_ShouldIncreaseCompletedCountAndCalculateVariance()
    {
        var request = new CompleteSessionRequest(
            DayNumber: 1,
            ActualMinutes: 35, // 5 minutes more than planned 30
            SelfRating: 5,
            LearnerNotes: "Finished all drills",
            AiFeedbackSnippet: "Good pronunciation on ending /t/."
        );

        var session = _progressService.CompleteSession(request);

        session.Should().NotBeNull();
        session.DayNumber.Should().Be(1);
        session.Status.Should().Be("Completed");
        session.ActualMinutes.Should().Be(35);

        var summary = _progressService.GetSummary();
        summary.TotalCompletedDays.Should().Be(1);
        summary.TotalActualMinutesSpent.Should().Be(35);
        summary.TotalPlannedMinutesExpected.Should().Be(30);
        summary.VarianceMinutes.Should().Be(5);
        summary.NextDayNumber.Should().Be(2);
        summary.CurrentStreakDays.Should().Be(1);
    }

    [Fact]
    public void CompleteMultipleSessions_ShouldTrackSequentialDays()
    {
        _progressService.CompleteSession(new CompleteSessionRequest(1, 30, 5, null, null));
        _progressService.CompleteSession(new CompleteSessionRequest(2, 25, 4, null, null));

        var summary = _progressService.GetSummary();

        summary.TotalCompletedDays.Should().Be(2);
        summary.TotalActualMinutesSpent.Should().Be(55);
        summary.TotalPlannedMinutesExpected.Should().Be(60);
        summary.VarianceMinutes.Should().Be(-5); // 5 mins under expected
        summary.NextDayNumber.Should().Be(3);
    }

    [Fact]
    public void ResetProgress_ShouldRestoreDefaultSummary()
    {
        _progressService.CompleteSession(new CompleteSessionRequest(1, 30, 5, null, null));
        _progressService.ResetProgress();

        var summary = _progressService.GetSummary();
        summary.TotalCompletedDays.Should().Be(0);
        summary.CurrentStreakDays.Should().Be(0);
        summary.NextDayNumber.Should().Be(1);
        summary.TotalActualMinutesSpent.Should().Be(0);
    }

    [Fact]
    public void GetSessionByDay_ShouldReturnSessionWhenExists()
    {
        _progressService.CompleteSession(new CompleteSessionRequest(1, 30, 5, "Good focus", "No issues"));

        var session = _progressService.GetSessionByDay(1);
        session.Should().NotBeNull();
        session!.DayNumber.Should().Be(1);
        session.LearnerNotes.Should().Be("Good focus");
        session.AiFeedbackSnippet.Should().Be("No issues");

        var missing = _progressService.GetSessionByDay(99);
        missing.Should().BeNull();
    }
}
