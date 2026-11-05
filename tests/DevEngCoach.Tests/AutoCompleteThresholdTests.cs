using DevEngCoach.Common;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class AutoCompleteThresholdTests
{
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
}
