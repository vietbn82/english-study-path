using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;

namespace DevEngCoach.Tests;

public class PrPolisherServiceTests
{
    private readonly PrPolisherService _polisher = new();

    [Fact]
    public async Task PolishAsync_WithBluntPerformanceComment_TransformsIntoDiplomaticConcurrencyFeedback()
    {
        // Arrange
        var request = new PrPolishRequest(
            InputText: "this code slow fix it",
            Tone: PrPolishTones.ConstructiveReview
        );

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().Be("Consider profiling or caching this operation to prevent potential latency bottlenecks under high concurrency.");
        result.Explanation.Should().Contain("concurrency");
        result.KeyPhrasesUsed.Should().Contain("latency bottlenecks");
        result.KeyPhrasesUsed.Should().Contain("profiling or caching");
        result.AvoidedAntiPatterns.Should().Contain(p => p.Contains("fix it"));
        result.AvoidedAntiPatterns.Should().Contain(p => p.Contains("this code slow"));
        result.AlternativeDraft.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PolishAsync_WithDirectAccusatoryNegative_TransformsIntoInquiryAboutDesignRationale()
    {
        // Arrange
        var request = new PrPolishRequest(
            InputText: "why you do this wrong",
            Tone: PrPolishTones.ConstructiveReview
        );

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().StartWith("Could you share the reasoning behind this design? In similar paths, we usually favor");
        result.Explanation.Should().Contain("design trade-offs");
        result.KeyPhrasesUsed.Should().Contain("reasoning behind this design");
        result.KeyPhrasesUsed.Should().Contain("separation of concerns");
        result.AvoidedAntiPatterns.Should().Contain(p => p.Contains("Accusatory 'you'"));
        result.AvoidedAntiPatterns.Should().Contain(p => p.Contains("Defensive trigger ('wrong')"));
        result.AlternativeDraft.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PolishAsync_WithBrokenCommitMessage_FormatsAsConventionalCommitWithAuthScope()
    {
        // Arrange
        var request = new PrPolishRequest(
            InputText: "fix bug login",
            Tone: PrPolishTones.CommitMessage
        );

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().Be("fix(auth): resolve null reference exception during token validation");
        result.Explanation.Should().Contain("Conventional Commits");
        result.KeyPhrasesUsed.Should().Contain("conventional commit");
        result.KeyPhrasesUsed.Should().Contain("token validation");
        result.AvoidedAntiPatterns.Should().Contain(p => p.Contains("Vague commit subject"));
        result.AlternativeDraft.Should().NotBeNullOrWhiteSpace();
    }

    [Theory]
    [InlineData("DiplomaticPushback", "backward compatibility")]
    [InlineData("TechnicalInquiry", "reasoning behind this design")]
    [InlineData("Compliment", "clean separation of concerns")]
    [InlineData("CommitMessage", "conventional commit")]
    public async Task PolishAsync_WithDifferentTones_AppliesToneSpecificSeniorPatterns(string toneName, string expectedKeyPhrase)
    {
        // Arrange
        var request = new PrPolishRequest(
            InputText: "Change the payment gateway integration",
            Tone: toneName
        );

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().NotBeNullOrWhiteSpace();
        result.Explanation.Should().NotBeNullOrWhiteSpace();
        result.KeyPhrasesUsed.Should().Contain(expectedKeyPhrase);
        result.AlternativeDraft.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task PolishAsync_WithEmptyOrWhitespaceInput_ReturnsGracefulGuidance()
    {
        // Arrange
        var request = new PrPolishRequest(InputText: "   ");

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().Contain("provide a code comment");
        result.AvoidedAntiPatterns.Should().Contain("Empty review comment");
    }

    [Fact]
    public async Task PolishAsync_WithCodeContext_SuppliesCompleteFeedbackWithExplanation()
    {
        // Arrange
        var request = new PrPolishRequest(
            InputText: "null pointer exception here",
            Tone: PrPolishTones.ConstructiveReview,
            CodeContext: "var token = request.Headers[\"Authorization\"].FirstOrDefault();"
        );

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().Contain("defensive null validation");
        result.KeyPhrasesUsed.Should().Contain("defensive programming");
        result.KeyPhrasesUsed.Should().Contain("fail-fast validation");
        result.AvoidedAntiPatterns.Should().NotBeEmpty();
    }

    [Fact]
    public async Task PolishAsync_WithMissingTestsComment_PromotesBoundaryCoverageVerification()
    {
        // Arrange
        var request = new PrPolishRequest(
            InputText: "no tests why merge",
            Tone: PrPolishTones.ConstructiveReview
        );

        // Act
        var result = await _polisher.PolishAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.PolishedText.Should().Contain("unit test coverage");
        result.KeyPhrasesUsed.Should().Contain("boundary conditions");
        result.KeyPhrasesUsed.Should().Contain("edge cases");
    }

    [Theory]
    [InlineData("constructive-review")]
    [InlineData("constructive_review")]
    [InlineData("CONSTRUCTIVEREVIEW")]
    [InlineData("constructive review")]
    public void PrPolishTones_Parse_HandlesVariousStringFormats(string rawTone)
    {
        var parsed = PrPolishTones.Parse(rawTone);
        parsed.Should().Be(PrPolishTone.ConstructiveReview);
    }
}
