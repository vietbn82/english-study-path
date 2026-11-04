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
}
