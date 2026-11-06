using System.Net;
using System.Net.Http.Json;
using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace DevEngCoach.Tests;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCurriculum_Returns200WithAll90Days()
    {
        var response = await _client.GetAsync("/api/curriculum");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var lessons = await response.Content.ReadFromJsonAsync<List<Lesson>>();
        lessons.Should().NotBeNull();
        lessons!.Count.Should().Be(90);
    }

    [Fact]
    public async Task GetCurriculumDay1_ReturnsValidLessonData()
    {
        var response = await _client.GetAsync("/api/curriculum/1");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var lesson = await response.Content.ReadFromJsonAsync<Lesson>();
        lesson.Should().NotBeNull();
        lesson!.DayNumber.Should().Be(1);
        lesson.SprintId.Should().Be(1);
        lesson.Title.Should().Contain("Final /t/ vs /d/");
    }

    [Fact]
    public async Task GetProgressSummary_ReturnsValidSummary()
    {
        var response = await _client.GetAsync("/api/progress");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var summary = await response.Content.ReadFromJsonAsync<ProgressSummary>();
        summary.Should().NotBeNull();
        summary!.TotalPlannedDays.Should().Be(90);
    }

    [Fact]
    public async Task PostAiEvaluate_ReturnsActionableFeedback()
    {
        var request = new AiEvaluationRequest(
            DayNumber: 1,
            InputText: "Yesterday I work on bug and test it."
        );

        var response = await _client.PostAsJsonAsync("/api/ai/evaluate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var evaluation = await response.Content.ReadFromJsonAsync<AiEvaluationResponse>();
        evaluation.Should().NotBeNull();
        evaluation!.Success.Should().BeTrue();
        evaluation.GrammarCorrections.Should().NotBeNullOrWhiteSpace();
        evaluation.SeniorDevRefactoring.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetReminderStatus_ReturnsConfigured22Target()
    {
        var response = await _client.GetAsync("/api/reminder/status");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        json.Should().Contain("22:00");
    }

    [Fact]
    public async Task PostStandupSimulate_ReturnsStructuredFeedback()
    {
        var request = new StandupSimulationRequest(
            Yesterday: "Yesterday I fix bug in auth controller.",
            Today: "Today I will deploy the hotfix to staging.",
            Blockers: "No blockers currently."
        );

        var response = await _client.PostAsJsonAsync("/api/ai/standup-simulate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<StandupSimulationResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.GrammarFeedback.Should().NotBeNullOrWhiteSpace();
        result.SeniorTechLeadRefactor.Should().NotBeNullOrWhiteSpace();
        result.FluencyScore.Should().BeInRange(50, 100);
    }

    [Fact]
    public async Task PostDemoSimulate_ReturnsConnectedSpeechFeedback()
    {
        var request = new DemoSimulationRequest(
            Context: "In this sprint, we implemented Redis distributed caching.",
            Architecture: "Under the hood, we used the decorator pattern around our repository.",
            TechnicalHighlights: "Latency dropped by 65 percent.",
            QaInvite: "I would like to open the floor for any questions."
        );

        var response = await _client.PostAsJsonAsync("/api/ai/demo-simulate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<DemoSimulationResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.ConnectedSpeech.Should().NotBeNull();
        result.SeniorDevPresentationScript.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PostPingPongSimulate_ReturnsADQEvaluation()
    {
        var request = new PingPongSimulationRequest(
            Answer: "I had a productive weekend hiking in the mountains.",
            Detail: "The weather was crisp and clear, which really helped recharge after the release.",
            QuestionBack: "Did you get a chance to take some time off over the weekend?"
        );

        var response = await _client.PostAsJsonAsync("/api/ai/pingpong-simulate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<PingPongSimulationResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.HasDirectAnswer.Should().BeTrue();
        result.HasDetail.Should().BeTrue();
        result.HasQuestionBack.Should().BeTrue();
        result.NaturalnessScore.Should().BeInRange(50, 100);
    }

    [Fact]
    public async Task PostQuickLookup_ReturnsIpaAndMeaning()
    {
        var request = new QuickLookupRequest("commit");

        var response = await _client.PostAsJsonAsync("/api/ai/lookup", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<QuickLookupResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Text.Should().Be("commit");
        result.Ipa.Should().Contain("/kəˈmɪt/");
        result.MeaningVi.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetSparringScenarios_ReturnsScenarios()
    {
        var response = await _client.GetAsync("/api/sparring/scenarios");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var scenarios = await response.Content.ReadFromJsonAsync<List<SparringScenario>>();
        scenarios.Should().NotBeNull();
        scenarios!.Count.Should().BeGreaterThanOrEqualTo(3);
        scenarios.Should().Contain(s => s.Id == "arch-debate");
    }

    [Fact]
    public async Task PostSparringTurn_ReturnsCoachingResponse()
    {
        var request = new SparringTurnRequest(
            ScenarioId: "arch-debate",
            UserSpeech: "Uhm, basically we should use microservices because, like, they scale independently."
        );

        var response = await _client.PostAsJsonAsync("/api/sparring/turn", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<SparringResponse>();
        result.Should().NotBeNull();
        result!.FillerWordsDetected.Should().Contain("basically");
        result.DiplomacyScore.Should().BeInRange(1, 100);
        result.TechnicalClarityScore.Should().BeInRange(1, 100);
        result.SeniorLeadRefinement.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PostPrPolish_ReturnsPolishedReviewComment()
    {
        var request = new PrPolishRequest(
            InputText: "this code slow fix it",
            Tone: "ConstructiveReview"
        );

        var response = await _client.PostAsJsonAsync("/api/pr/polish", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<PrPolishResponse>();
        result.Should().NotBeNull();
        result!.PolishedText.Should().NotBeNullOrWhiteSpace();
        result.PolishedText.Should().NotContain("this code slow fix it");
        result.AvoidedAntiPatterns.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetSrsQueueAndStats_ReturnsValidData()
    {
        var statsResponse = await _client.GetAsync("/api/srs/stats");
        statsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var stats = await statsResponse.Content.ReadFromJsonAsync<SrsStats>();
        stats.Should().NotBeNull();
        stats!.TotalTracked.Should().BeGreaterThanOrEqualTo(1);

        var queueResponse = await _client.GetAsync("/api/srs/queue");
        queueResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var queue = await queueResponse.Content.ReadFromJsonAsync<List<SrsItem>>();
        queue.Should().NotBeNull();
    }

    [Fact]
    public async Task PostSrsEnrollAndReview_TracksProgress()
    {
        var enrollRequest = new SrsEnrollRequest(
            WordOrPhrase: "distributed",
            TargetPhoneme: "/d/ + /b/",
            ContextSentence: "We are designing a distributed transaction coordinator.",
            InitialScore: 65
        );

        var enrollResponse = await _client.PostAsJsonAsync("/api/srs/enroll", enrollRequest);
        enrollResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var enrolledItem = await enrollResponse.Content.ReadFromJsonAsync<SrsItem>();
        enrolledItem.Should().NotBeNull();
        enrolledItem!.WordOrPhrase.Should().Be("distributed");

        var reviewRequest = new SrsReviewRequest(enrolledItem.Id, 85);
        var reviewResponse = await _client.PostAsJsonAsync("/api/srs/review", reviewRequest);
        reviewResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var reviewedItem = await reviewResponse.Content.ReadFromJsonAsync<SrsItem>();
        reviewedItem.Should().NotBeNull();
        reviewedItem!.LastScore.Should().Be(85);
     }
    [Fact]
    public async Task PostSpeechScore_ReturnsValidPhonemeBreakdown()
    {
        var request = new SpeechScoreRequest(1, "commit", "/t/", "commit");
        var response = await _client.PostAsJsonAsync("/api/speech/score", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<SpeechScoreResponse>();
        result.Should().NotBeNull();
        result!.OverallAccuracy.Should().Be(100);
        result.IsPassing.Should().BeTrue();
    }

    [Fact]
    public async Task GetAnalyticsBurndownAndHeatmap_ReturnsData()
    {
        var burndownResponse = await _client.GetAsync("/api/analytics/burndown");
        burndownResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var burndown = await burndownResponse.Content.ReadFromJsonAsync<BurndownData>();
        burndown.Should().NotBeNull();
        burndown!.TotalDays.Should().Be(90);

        var heatmapResponse = await _client.GetAsync("/api/analytics/heatmap");
        heatmapResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var heatmap = await heatmapResponse.Content.ReadFromJsonAsync<List<HeatmapCell>>();
        heatmap.Should().NotBeNull();
        heatmap!.Count.Should().Be(90);
    }

    [Fact]
    public async Task PostShadowingEvaluate_ReturnsFeedback()
    {
        var request = new ShadowingEvaluateRequest(1, "Yesterday, I focused on the deployment pipeline.", 3.5, 3.4);
        var response = await _client.PostAsJsonAsync("/api/shadowing/evaluate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ShadowingFeedbackResponse>();
        result.Should().NotBeNull();
        result!.PacingDiagnosis.Should().Contain("Optimal");
        result.PacingScore.Should().BeGreaterThanOrEqualTo(80);
    }

    [Fact]
    public async Task PostOneOnOneSimulate_ReturnsAlignmentFeedback()
    {
        var request = new OneOnOneSimulationRequest(
            ProgressAndWins: "Completed Sprint 12 milestones with 95% test coverage.",
            SystemBottleneck: "CI/CD execution bottleneck slows down team PR reviews.",
            CareerAspiration: "Stepping up to drive architecture reviews for cross-squad projects."
        );
        var response = await _client.PostAsJsonAsync("/api/ai/one-on-one-simulate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<OneOnOneSimulationResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.AlignmentScore.Should().BeGreaterThanOrEqualTo(80);
        result.SeniorLeadScript.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PostConnectedSpeechAnalyze_ReturnsLinkingOccurrences()
    {
        var request = new ConnectedSpeechAnalyzeRequest("Please check it out on the staging server.");
        var response = await _client.PostAsJsonAsync("/api/ai/connected-speech-analyze", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ConnectedSpeechAnalyzeResponse>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.LinkedRepresentation.Should().Contain("‿");
    }

    [Fact]
    public async Task GetBackupExport_Returns200WithFullState()
    {
        var response = await _client.GetAsync("/api/backup/export");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<BackupPayload>();
        payload.Should().NotBeNull();
        payload!.Version.Should().Be(1);
        payload.Progress.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCapstoneSpec_Day30_Returns200WithMilestoneRubric()
    {
        var response = await _client.GetAsync("/api/capstone/30");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var spec = await response.Content.ReadFromJsonAsync<CapstoneSpec>();
        spec.Should().NotBeNull();
        spec!.DayNumber.Should().Be(30);
        spec.TimeLimitSeconds.Should().Be(90);
        spec.FocusPhonetics.Should().Contain(p => p.Contains("/t/"));
    }

    [Fact]
    public async Task PostCapstoneEvaluate_ValidSubmission_ReturnsEvaluationAndCertificate()
    {
        var request = new CapstoneSubmissionRequest(
            DayNumber: 30,
            Transcript: "Yesterday, I finished the unit test and committed the code. Today, I will deploy the build to staging. I am not blocked by any issue.",
            DurationSeconds: 85,
            UserNotes: "Final milestone rehearsal."
        );
        var response = await _client.PostAsJsonAsync("/api/capstone/evaluate", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<CapstoneEvaluationResult>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Scorecard.Passed.Should().BeTrue();
        result.CertificateId.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PostCapstoneEvaluate_EmptyTranscript_ReturnsBadRequest()
    {
        var request = new CapstoneSubmissionRequest(
            DayNumber: 30,
            Transcript: "",
            DurationSeconds: 0,
            UserNotes: ""
        );
        var response = await _client.PostAsJsonAsync("/api/capstone/evaluate", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}