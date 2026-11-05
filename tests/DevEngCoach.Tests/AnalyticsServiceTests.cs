using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DevEngCoach.Tests;

public class AnalyticsServiceTests : IDisposable
{
    private readonly string testProgressDir;
    private readonly string testBadgesPath;
    private readonly ProgressService progressService;
    private readonly CurriculumService curriculumService;
    private readonly AnalyticsService analyticsService;

    public AnalyticsServiceTests()
    {
        testProgressDir = Path.Combine(Path.GetTempPath(), $"progress_test_{Guid.NewGuid():N}");
        Directory.CreateDirectory(Path.Combine(testProgressDir, "Data"));
        testBadgesPath = Path.Combine(Path.GetTempPath(), $"badges_test_{Guid.NewGuid():N}.json");

        var progressEnv = new FakeWebHostEnvironment(testProgressDir);
        var projectDir = GetProjectDir();
        var curriculumEnv = new FakeWebHostEnvironment(projectDir);

        progressService = new ProgressService(progressEnv);
        curriculumService = new CurriculumService(curriculumEnv);
        analyticsService = new AnalyticsService(
            progressService,
            curriculumService,
            NullLogger<AnalyticsService>.Instance,
            testBadgesPath
        );
    }

    private static string GetProjectDir()
    {
        var baseDir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(baseDir, "src", "DevEngCoach")) && Directory.GetParent(baseDir) != null)
        {
            baseDir = Directory.GetParent(baseDir)!.FullName;
        }
        return Path.Combine(baseDir, "src", "DevEngCoach");
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(testProgressDir)) Directory.Delete(testProgressDir, true);
            if (File.Exists(testBadgesPath)) File.Delete(testBadgesPath);
        }
        catch { }
    }

    [Fact]
    public async Task GetBurndownData_ShouldReturn90DaysTrajectory()
    {
        var burndown = await analyticsService.GetBurndownDataAsync();

        burndown.TotalDays.Should().Be(90);
        burndown.Points.Should().HaveCount(90);
        burndown.Points[0].IdealRemainingDays.Should().Be(90);
        burndown.Points[^1].IdealRemainingDays.Should().Be(1);
        burndown.SprintBoundaries.Should().Contain([30, 60, 90]);
    }

    [Fact]
    public async Task GetHeatmapGrid_ShouldReturn90CellsWithCorrectSprintIds()
    {
        // Complete Day 1 with 35 mins
        progressService.CompleteSession(new CompleteSessionRequest(1, 35, 5, "Good focus", null));

        var heatmap = await analyticsService.GetHeatmapGridAsync();

        heatmap.Should().HaveCount(90);
        var day1 = heatmap.First(h => h.DayNumber == 1);
        day1.IntensityLevel.Should().Be(3);
        day1.ActualMinutes.Should().Be(35);
        day1.SprintId.Should().Be(1);

        var day45 = heatmap.First(h => h.DayNumber == 45);
        day45.SprintId.Should().Be(2);

        var day75 = heatmap.First(h => h.DayNumber == 75);
        day75.SprintId.Should().Be(3);
    }

    [Fact]
    public async Task GetStreakBadges_WhenStreakReaches7Days_ShouldUnlockFireBadge()
    {
        // Simulate 7 consecutive completed days
        for (var day = 1; day <= 7; day++)
        {
            progressService.CompleteSession(new CompleteSessionRequest(day, 30, 4, null, null));
        }

        var badges = await analyticsService.GetStreakBadgesAsync();

        var badge7d = badges.FirstOrDefault(b => b.BadgeId == "badge_7d");
        badge7d.Should().NotBeNull();
        badge7d!.IsUnlocked.Should().BeTrue();
        badge7d.Emoji.Should().Be("🔥");
    }

    [Fact]
    public async Task GetWeeklyVelocity_ShouldReturn13WeeksAggregation()
    {
        progressService.CompleteSession(new CompleteSessionRequest(1, 30, 4, null, null));
        progressService.CompleteSession(new CompleteSessionRequest(2, 40, 5, null, null));

        var velocity = await analyticsService.GetWeeklyVelocityAsync();

        velocity.Should().HaveCount(13);
        var week1 = velocity.First(w => w.WeekNumber == 1);
        week1.SessionsCompleted.Should().Be(2);
        week1.TotalMinutes.Should().Be(70);
        week1.AverageMinutesPerSession.Should().Be(35);
    }
}
