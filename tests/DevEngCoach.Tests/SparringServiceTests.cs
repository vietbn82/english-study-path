using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace DevEngCoach.Tests;

public class SparringServiceTests
{
    private readonly SparringService _service;

    public SparringServiceTests()
    {
        // Disable external process execution during unit test runs to ensure deterministic, fast test execution
        Environment.SetEnvironmentVariable("DEVENGCOACH_DISABLE_AGY", "1");
        _service = new SparringService(NullLogger<SparringService>.Instance);
    }

    [Fact]
    public void GetScenarios_ReturnsAllThreeScenariosWithValidMetadata()
    {
        // Act
        var scenarios = _service.GetScenarios();

        // Assert
        scenarios.Should().HaveCount(3);

        var archDebate = scenarios.FirstOrDefault(s => s.Id == "arch-debate");
        archDebate.Should().NotBeNull();
        archDebate!.Title.Should().Be("Microservices vs Modular Monolith");
        archDebate.Category.Should().Be("Architecture & System Design");
        archDebate.RoleDescription.Should().Contain("Staff Architect");
        archDebate.OpeningLine.Should().Contain("distributed transactions");
        archDebate.KeyVocabulary.Should().Contain(["blast radius", "eventual consistency", "outbox pattern"]);

        var incidentSev1 = scenarios.FirstOrDefault(s => s.Id == "incident-sev1");
        incidentSev1.Should().NotBeNull();
        incidentSev1!.Title.Should().Be("Production DB Connection Pool Exhaustion");
        incidentSev1.Category.Should().Be("Incident Response & Triage");
        incidentSev1.RoleDescription.Should().Contain("VP of Engineering");
        incidentSev1.OpeningLine.Should().Contain("connection pool starvation");
        incidentSev1.KeyVocabulary.Should().Contain(["connection pool", "pg_stat_activity", "mitigation"]);

        var scopePushback = scenarios.FirstOrDefault(s => s.Id == "scope-pushback");
        scopePushback.Should().NotBeNull();
        scopePushback!.Title.Should().Be("Negotiating 50% Timeline Cut");
        scopePushback.Category.Should().Be("Engineering Leadership & Stakeholder Alignment");
        scopePushback.RoleDescription.Should().Contain("Product Director");
        scopePushback.OpeningLine.Should().Contain("skip writing unit and integration tests");
        scopePushback.KeyVocabulary.Should().Contain(["technical debt", "regression risk", "fast-follow"]);
    }

    [Fact]
    public async Task ProcessTurnAsync_WithArchDebate_ReturnsRealisticResponseAndRefinement()
    {
        // Arrange
        var request = new SparringTurnRequest(
            ScenarioId: "arch-debate",
            UserSpeech: "I propose we keep a modular monolith for now to avoid distributed transactions and outbox overhead, while keeping strict domain boundaries."
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.Should().NotBeNull();
        response.AiResponse.Should().NotBeNullOrWhiteSpace();
        response.NextQuestion.Should().Contain("distributed saga");
        response.SeniorLeadRefinement.Should().Contain("Modular Monolith");
        response.DiplomacyScore.Should().BeInRange(70, 100);
        response.TechnicalClarityScore.Should().BeInRange(70, 100);
        response.PronunciationAlerts.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ProcessTurnAsync_WithFillerWords_DetectsAllFillersAndAppliesPenalty()
    {
        // Arrange
        var speechWithFillers = "Actually, uhm, basically we should like use pg_stat_activity to check connections, you know?";
        var request = new SparringTurnRequest(
            ScenarioId: "incident-sev1",
            UserSpeech: speechWithFillers
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.FillerWordsDetected.Should().Contain(["actually", "uhm", "basically", "like", "you know"]);
        response.DiplomacyScore.Should().BeInRange(1, 95);
        response.TechnicalClarityScore.Should().BeInRange(1, 95);
    }

    [Fact]
    public async Task ProcessTurnAsync_WithIncidentSev1_ProvidesImmediateTriageRefinement()
    {
        // Arrange
        var request = new SparringTurnRequest(
            ScenarioId: "incident-sev1",
            UserSpeech: "Immediate mitigation: we will query pg_stat_activity, terminate idle connections, and activate circuit breakers to isolate the blast radius."
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.Should().NotBeNull();
        response.AiResponse.Should().Contain("pg_stat_activity");
        response.NextQuestion.Should().Contain("Postgres Primary");
        response.SeniorLeadRefinement.Should().Contain("Incident Commander");
        response.TechnicalClarityScore.Should().BeGreaterThan(80);
    }

    [Fact]
    public async Task ProcessTurnAsync_WithScopePushback_HandlesNegotiationAndRefinement()
    {
        // Arrange
        var request = new SparringTurnRequest(
            ScenarioId: "scope-pushback",
            UserSpeech: "I understand marketing's urgency for Friday. Instead of skipping automated tests and creating regression risk, I propose we descope the secondary features and deliver them as a fast-follow."
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.Should().NotBeNull();
        response.DiplomacyScore.Should().BeGreaterThan(80);
        response.TechnicalClarityScore.Should().BeGreaterThan(75);
        response.SeniorLeadRefinement.Should().Contain("descope");
        response.NextQuestion.Should().Contain("integration tests");
    }

    [Fact]
    public async Task ProcessTurnAsync_DiplomacyScore_AggressiveLanguageReceivesPenalty()
    {
        // Arrange
        var politeRequest = new SparringTurnRequest(
            ScenarioId: "scope-pushback",
            UserSpeech: "I understand your perspective and propose we collaborate on a phased strategy to safeguard the deadline and mitigate risk."
        );

        var aggressiveRequest = new SparringTurnRequest(
            ScenarioId: "scope-pushback",
            UserSpeech: "That is completely stupid and impossible. You can't ask that, it is not our problem and I won't do it."
        );

        // Act
        var politeResponse = await _service.ProcessTurnAsync(politeRequest);
        var aggressiveResponse = await _service.ProcessTurnAsync(aggressiveRequest);

        // Assert
        politeResponse.DiplomacyScore.Should().BeGreaterThan(aggressiveResponse.DiplomacyScore);
        aggressiveResponse.DiplomacyScore.Should().BeLessThan(50);
    }

    [Fact]
    public async Task ProcessTurnAsync_TechnicalSpeech_GeneratesEndingConsonantsAlerts()
    {
        // Arrange
        var speech = "We must test the commit request, build the thread node, verify the database service, manage users and nodes, and evaluate network throughput bandwidth.";
        var request = new SparringTurnRequest(
            ScenarioId: "arch-debate",
            UserSpeech: speech
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.PronunciationAlerts.Should().HaveCount(5);
        response.PronunciationAlerts.Should().Contain(a => a.Contains("/t/"));
        response.PronunciationAlerts.Should().Contain(a => a.Contains("/d/"));
        response.PronunciationAlerts.Should().Contain(a => a.Contains("/s/"));
        response.PronunciationAlerts.Should().Contain(a => a.Contains("/z/"));
        response.PronunciationAlerts.Should().Contain(a => a.Contains("/θ/"));
    }

    [Fact]
    public async Task ProcessTurnAsync_WithEmptyOrMinimalInput_DoesNotThrowAndClampsScores()
    {
        // Arrange
        var request = new SparringTurnRequest(
            ScenarioId: "arch-debate",
            UserSpeech: ""
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.Should().NotBeNull();
        response.DiplomacyScore.Should().BeInRange(1, 100);
        response.TechnicalClarityScore.Should().BeInRange(1, 100);
        response.PronunciationAlerts.Should().NotBeEmpty();
        response.FillerWordsDetected.Should().BeEmpty();
    }

    [Fact]
    public async Task ProcessTurnAsync_WithUnknownScenarioId_FallsBackSafely()
    {
        // Arrange
        var request = new SparringTurnRequest(
            ScenarioId: "non-existent-scenario-999",
            UserSpeech: "We recommend a resilient architectural pattern."
        );

        // Act
        var response = await _service.ProcessTurnAsync(request);

        // Assert
        response.Should().NotBeNull();
        response.SeniorLeadRefinement.Should().NotBeNullOrWhiteSpace();
        response.NextQuestion.Should().NotBeNullOrWhiteSpace();
    }
}
