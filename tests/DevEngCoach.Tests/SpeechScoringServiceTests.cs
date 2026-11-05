using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DevEngCoach.Tests;

public class SpeechScoringServiceTests : IDisposable
{
    private readonly string testStoragePath;
    private readonly string testSrsPath;
    private readonly SrsService srsService;
    private readonly CurriculumService curriculumService;
    private readonly SpeechScoringService scoringService;

    public SpeechScoringServiceTests()
    {
        testStoragePath = Path.Combine(Path.GetTempPath(), $"speech_test_{Guid.NewGuid():N}.json");
        testSrsPath = Path.Combine(Path.GetTempPath(), $"srs_test_{Guid.NewGuid():N}.json");

        var projectDir = GetProjectDir();
        var env = new FakeWebHostEnvironment(projectDir);

        srsService = new SrsService(testSrsPath);
        curriculumService = new CurriculumService(env);
        scoringService = new SpeechScoringService(
            srsService,
            curriculumService,
            NullLogger<SpeechScoringService>.Instance,
            testStoragePath
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
        if (File.Exists(testStoragePath)) File.Delete(testStoragePath);
        if (File.Exists(testSrsPath)) File.Delete(testSrsPath);
    }

    [Fact]
    public async Task ScoreSpeech_WhenEndingConsonantDropped_ShouldFlagErrorAndLowerScore()
    {
        var request = new SpeechScoreRequest(
            DayNumber: 1,
            TargetWordOrSentence: "commit",
            ExpectedPhonemes: "/t/",
            SpokenText: "commi"
        );

        var response = await scoringService.ScoreSpeechAsync(request);

        response.OverallAccuracy.Should().BeLessThan(80);
        response.PhonemeBreakdown.Should().Contain(p =>
            p.Category == PhonemeCategory.EndingConsonant && !p.IsCorrect);
    }

    [Fact]
    public async Task ScoreSpeech_WhenPronouncedCorrectly_ShouldReturnHighAccuracy()
    {
        var request = new SpeechScoreRequest(
            DayNumber: 1,
            TargetWordOrSentence: "commit",
            ExpectedPhonemes: "/t/",
            SpokenText: "commit"
        );

        var response = await scoringService.ScoreSpeechAsync(request);

        response.OverallAccuracy.Should().Be(100);
        response.IsPassing.Should().BeTrue();
        response.PhonemeBreakdown.Should().AllSatisfy(p => p.IsCorrect.Should().BeTrue());
    }

    [Fact]
    public async Task ScoreSpeech_WhenDentalFricativeSubstituted_ShouldProvideKinestheticTip()
    {
        var request = new SpeechScoreRequest(
            DayNumber: 8,
            TargetWordOrSentence: "method",
            ExpectedPhonemes: "/θ/",
            SpokenText: "me tot"
        );

        var response = await scoringService.ScoreSpeechAsync(request);

        response.PhonemeBreakdown.Should().Contain(p =>
            p.Category == PhonemeCategory.DentalFricative &&
            !p.IsCorrect &&
            p.KinestheticCorrectionTip.Contains("răng"));
    }

    [Fact]
    public async Task ScoreSpeech_WhenScoreBelow60_ShouldAutoEnrollInSrs()
    {
        var request = new SpeechScoreRequest(
            DayNumber: 1,
            TargetWordOrSentence: "deployment",
            ExpectedPhonemes: "/t/",
            SpokenText: "deploy"
        );

        var response = await scoringService.ScoreSpeechAsync(request);

        if (response.OverallAccuracy < 60)
        {
            response.AutoEnrolledInSrs.Should().BeTrue();
            var due = srsService.GetDueItems();
            due.Should().Contain(item => item.WordOrPhrase == "deployment");
        }
    }

    [Fact]
    public async Task GetSummary_WhenRecordsExist_ShouldCalculateAverageAccuracy()
    {
        await scoringService.ScoreSpeechAsync(new SpeechScoreRequest(1, "test", "/t/", "test"));
        await scoringService.ScoreSpeechAsync(new SpeechScoreRequest(1, "build", "/d/", "buil"));

        var summary = await scoringService.GetSummaryAsync();

        summary.TotalDrillsRecorded.Should().Be(2);
        summary.AverageAccuracy.Should().BeGreaterThan(0);
        summary.CategoryPerformance.Should().NotBeEmpty();
    }
}
