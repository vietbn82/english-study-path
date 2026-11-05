using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class ShadowingServiceTests
{
    private readonly CurriculumService curriculumService;
    private readonly ShadowingService shadowingService;

    public ShadowingServiceTests()
    {
        var projectDir = GetProjectDir();
        var env = new FakeWebHostEnvironment(projectDir);

        curriculumService = new CurriculumService(env);
        shadowingService = new ShadowingService(curriculumService);
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

    [Fact]
    public async Task EvaluateShadowing_WhenUserRushes_ShouldFlagRushedDiagnosis()
    {
        var request = new ShadowingEvaluateRequest(
            DayNumber: 1,
            TargetSentence: "Yesterday, I focused on the deployment pipeline.",
            ReferenceDurationSeconds: 4.0,
            UserDurationSeconds: 2.0
        );

        var response = await shadowingService.EvaluateShadowingAsync(request);

        response.SpeedRatio.Should().Be(0.5);
        response.PacingDiagnosis.Should().Contain("Rushed");
        response.PacingScore.Should().BeLessThan(80);
        response.StressTimingTip.Should().Contain("Syllable-timed");
    }

    [Fact]
    public async Task EvaluateShadowing_WhenPacingIsOptimal_ShouldReturnHighScore()
    {
        var request = new ShadowingEvaluateRequest(
            DayNumber: 1,
            TargetSentence: "Yesterday, I focused on the deployment pipeline.",
            ReferenceDurationSeconds: 3.5,
            UserDurationSeconds: 3.4
        );

        var response = await shadowingService.EvaluateShadowingAsync(request);

        response.PacingDiagnosis.Should().Contain("Optimal");
        response.PacingScore.Should().BeGreaterThanOrEqualTo(85);
    }

    [Fact]
    public async Task GetReferenceInfo_ShouldReturnSentenceAndDurationEstimate()
    {
        var info = await shadowingService.GetReferenceInfoAsync(1);

        info.DayNumber.Should().Be(1);
        info.SentenceFrame.Should().NotBeNullOrWhiteSpace();
        info.TargetDurationSeconds.Should().BeGreaterThan(1.0);
    }
}
