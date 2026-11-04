using System.Net;
using System.Net.Http.Json;
using DevEngCoach.Common;
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
}
