using System.Net;
using System.Net.Http.Json;
using DevEngCoach.Common;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DevEngCoach.Tests;

public class AutoCompleteThresholdTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AutoCompleteThresholdTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData(10, 7, true, 70)]
    [InlineData(10, 8, true, 80)]
    [InlineData(10, 10, true, 100)]
    [InlineData(10, 6, false, 60)]
    [InlineData(10, 4, false, 40)]
    public void ThresholdCalculation_ShouldTriggerAutoCompletionAt70Percent(
        int total, int correct, bool expectedReached, int expectedPercentage)
    {
        var percentage = (int)Math.Round((double)correct / total * 100);
        var reached = percentage >= 70;

        reached.Should().Be(expectedReached);
        percentage.Should().Be(expectedPercentage);
    }

    [Theory]
    [InlineData(10, 6, 60, 6, true, "AutoThreshold")]
    [InlineData(10, 7, 70, 7, true, "AutoThreshold")]
    [InlineData(10, 7, 80, 8, false, "Pending")]
    [InlineData(10, 8, 80, 8, true, "AutoThreshold")]
    [InlineData(10, 8, 90, 9, false, "Pending")]
    [InlineData(10, 9, 90, 9, true, "AutoThreshold")]
    [InlineData(5, 3, 70, 3, true, "AutoThreshold")] // floor(5 * 0.7) = 3
    [InlineData(10, 10, 70, 7, true, "Perfect")]
    public async Task CheckThreshold_RespectsConfiguredPercentageAndProportionalFloor(
        int total, int correct, int thresholdPct, int expectedRequired, bool expectedReached, string expectedMode)
    {
        var request = new DrillThresholdCheckRequest(
            DayNumber: 1,
            TotalWordsCount: total,
            CorrectWordsCount: correct,
            FailedWords: ["method"],
            TargetPhoneme: "/t/",
            ThresholdPercentage: thresholdPct,
            CorrectWords: ["commit", "build"]
        );

        var response = await _client.PostAsJsonAsync("/api/drill/check-threshold", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<DrillThresholdCheckResponse>();
        result.Should().NotBeNull();
        result!.ThresholdReached.Should().Be(expectedReached);
        result.RequiredWordsCount.Should().Be(expectedRequired);
        result.CompletionMode.Should().Be(expectedMode);
        result.DayMarkedComplete.Should().Be(expectedReached);
        result.NailedWords.Should().Contain(["commit", "build"]);
    }
}
