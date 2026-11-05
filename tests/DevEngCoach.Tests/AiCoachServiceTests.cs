using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace DevEngCoach.Tests;

public class AiCoachServiceTests
{
    private readonly AiCoachService _aiCoachService;

    public AiCoachServiceTests()
    {
        var baseDir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(baseDir, "src", "DevEngCoach")) && Directory.GetParent(baseDir) != null)
        {
            baseDir = Directory.GetParent(baseDir)!.FullName;
        }

        var projectDir = Path.Combine(baseDir, "src", "DevEngCoach");
        var env = new FakeWebHostEnvironment(projectDir);
        var curriculum = new CurriculumService(env);
        _aiCoachService = new AiCoachService(curriculum, NullLogger<AiCoachService>.Instance);
    }

    [Fact]
    public async Task EvaluateAsync_WithPastTenseMistake_DetectsMissingCodaAndSuggestsCorrection()
    {
        var request = new AiEvaluationRequest(
            DayNumber: 1,
            InputText: "Yesterday I fix bug in the controller."
        );

        var result = await _aiCoachService.EvaluateAsync(request);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.GrammarCorrections.Should().Contain("fixed");
        result.PhoneticMechanicsAlerts.Should().NotBeEmpty();
        result.SeniorDevRefactoring.Should().NotBeNullOrWhiteSpace();
        result.FluencyScore.Should().BeInRange(50, 100);
    }

    [Fact]
    public async Task EvaluateAsync_WithDentalFricativeContext_ProvidesMechanicalGuidance()
    {
        var request = new AiEvaluationRequest(
            DayNumber: 7, // Dental fricatives /θ/ /ð/
            InputText: "I think the auth service has an authentication issue."
        );

        var result = await _aiCoachService.EvaluateAsync(request);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.PhoneticMechanicsAlerts.Should().NotBeEmpty();
        result.NaturalSpeakingTip.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task SimulateOneOnOneAsync_WithMetricsAndBottlenecks_ReturnsHighAlignmentScoreAndStaffScript()
    {
        var request = new OneOnOneSimulationRequest(
            ProgressAndWins: "Shipped auth worker service early, cut latency by 35% with 92% test coverage.",
            SystemBottleneck: "Our CI/CD pipeline takes 22 minutes, creating a developer feedback loop bottleneck.",
            CareerAspiration: "I want to take ownership of decoupling the legacy payment domain next quarter."
        );

        var result = await _aiCoachService.SimulateOneOnOneAsync(request);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.AlignmentScore.Should().BeGreaterThanOrEqualTo(90);
        result.ImpactFeedback.Should().Contain("Rất tốt");
        result.SeniorLeadScript.Should().Contain("Progress & Impact");
        result.RecommendedPhoneticCues.Should().NotBeEmpty();
    }

    [Fact]
    public async Task AnalyzeConnectedSpeechAsync_WithConsonantVowelAndFlapT_DetectsOccurrencesAndLiaisons()
    {
        var request = new ConnectedSpeechAnalyzeRequest("We need to check it out and benchmark data latency.");

        var result = await _aiCoachService.AnalyzeConnectedSpeechAsync(request);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.LinkedRepresentation.Should().Contain("‿");
        result.Occurrences.Should().Contain(o => o.RuleType.Contains("Consonant-to-Vowel") || o.RuleType.Contains("Flap T"));
        result.AudioPacingTip.Should().NotBeNullOrWhiteSpace();
    }
}
