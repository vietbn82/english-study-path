using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace DevEngCoach.Tests;

public class CapstoneServiceTests
{
    private readonly CapstoneService _service = new(NullLogger<CapstoneService>.Instance);

    [Theory]
    [InlineData(30, 90, "Milestone 1")]
    [InlineData(60, 300, "Milestone 2")]
    [InlineData(90, 600, "Milestone 3")]
    public void GetCapstoneSpec_ReturnsAccurateSpecifications_ForMilestones(int day, int expectedTimeLimit, string expectedMilestonePrefix)
    {
        // Act
        var spec = _service.GetCapstoneSpec(day);

        // Assert
        spec.Should().NotBeNull();
        spec.DayNumber.Should().Be(day);
        spec.TimeLimitSeconds.Should().Be(expectedTimeLimit);
        spec.MilestoneName.Should().StartWith(expectedMilestonePrefix);
        spec.Title.Should().NotBeNullOrWhiteSpace();
        spec.TargetScenario.Should().NotBeNullOrWhiteSpace();
        spec.FocusPhonetics.Should().NotBeEmpty();
        spec.EvaluationCriteria.Should().NotBeEmpty();
        spec.PassingStandard.Should().Contain("70");
    }

    [Fact]
    public void GetCapstoneSpec_InvalidDay_ThrowsArgumentOutOfRangeException()
    {
        // Act
        var act = () => _service.GetCapstoneSpec(45);

        // Assert
        act.Should().Throw<ArgumentOutOfRangeException>()
            .WithParameterName("day");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null!)]
    public async Task EvaluateCapstoneAsync_RejectsEmptyTranscript_Gracefully(string? emptyTranscript)
    {
        // Arrange
        var request = new CapstoneSubmissionRequest(
            DayNumber: 30,
            Transcript: emptyTranscript!,
            DurationSeconds: 60,
            UserNotes: "Testing empty transcript"
        );

        // Act
        var result = await _service.EvaluateCapstoneAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Scorecard.Passed.Should().BeFalse();
        result.Scorecard.OverallScore.Should().Be(0);
        result.CertificateId.Should().BeNull();
        result.CertificateTitle.Should().BeNull();
        result.GraduationMessage.Should().BeNull();
        result.Scorecard.RubricFeedback.Should().Contain("empty");
    }

    [Fact]
    public async Task EvaluateCapstoneAsync_InvalidDay_ReturnsFailureGracefully()
    {
        // Arrange
        var request = new CapstoneSubmissionRequest(
            DayNumber: 15,
            Transcript: "Yesterday I worked on the api endpoint and today I will merge the PR.",
            DurationSeconds: 45,
            UserNotes: "Day 15 is not a capstone"
        );

        // Act
        var result = await _service.EvaluateCapstoneAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Scorecard.Passed.Should().BeFalse();
        result.CertificateId.Should().BeNull();
        result.Scorecard.RubricFeedback.Should().Contain("Invalid capstone day");
    }

    [Fact]
    public async Task EvaluateCapstoneAsync_Day30_ValidSubmission_PassesAndAwardsCertificate()
    {
        // Arrange
        var transcript = @"
            Yesterday, I investigated and resolved the bug in the authentication endpoint.
            I fixed the query performance issue, tested all edge cases, and merged the PR into main.
            Today, I am planning to deploy the service to staging and configure the redis cache.
            Regarding blockers, I have no blockers at this time; my sprint tasks are fully on track.";

        var request = new CapstoneSubmissionRequest(
            DayNumber: 30,
            Transcript: transcript,
            DurationSeconds: 30,
            UserNotes: "Sprint 4 standup update"
        );

        // Act
        var result = await _service.EvaluateCapstoneAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Scorecard.Passed.Should().BeTrue();
        result.Scorecard.OverallScore.Should().BeGreaterThanOrEqualTo(70);
        result.Scorecard.PhoneticScore.Should().BeGreaterThanOrEqualTo(70);
        result.Scorecard.FluencyPacingScore.Should().BeGreaterThanOrEqualTo(70);
        result.Scorecard.SentenceStructureScore.Should().BeGreaterThanOrEqualTo(70);
        result.Scorecard.TechnicalVocabScore.Should().BeGreaterThanOrEqualTo(70);
        result.Scorecard.Strengths.Should().NotBeEmpty();

        result.CertificateId.Should().NotBeNullOrWhiteSpace();
        result.CertificateId.Should().StartWith("CERT-DEVENG-D30-");
        result.CertificateTitle.Should().Be("Milestone Certificate: Professional Standup & Pronunciation");
        result.GraduationMessage.Should().Contain("consonant endings");
    }

    [Fact]
    public async Task EvaluateCapstoneAsync_Day60_ValidSubmission_PassesAndAwardsCertificate()
    {
        // Arrange
        var transcript = @"
            Welcome everyone. Today I'm presenting our new real-time event streaming feature.
            Let's dive under the hood into the architecture. We built an event-driven pipeline
            where data arrives at our API gateway, and our background router processes the message payload.
            To spin it up, we roll it out through our automated staging cluster with zero downtime.
            As we check it out in this live demo walkthrough, notice how latency dropped by 40% and throughput increased.
            In terms of trade-offs, we chose eventual consistency over distributed locks to avoid database bottlenecks.";

        var request = new CapstoneSubmissionRequest(
            DayNumber: 60,
            Transcript: transcript,
            DurationSeconds: 40,
            UserNotes: "Sprint 8 feature demo"
        );

        // Act
        var result = await _service.EvaluateCapstoneAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Scorecard.Passed.Should().BeTrue();
        result.Scorecard.OverallScore.Should().BeGreaterThanOrEqualTo(70);
        result.Scorecard.PhoneticScore.Should().BeGreaterThanOrEqualTo(70);
        result.CertificateId.Should().NotBeNullOrWhiteSpace();
        result.CertificateId.Should().StartWith("CERT-DEVENG-D60-");
        result.CertificateTitle.Should().Be("Milestone Certificate: Sprint Demo & Technical Storytelling");
        result.GraduationMessage.Should().Contain("linked connected speech");
    }

    [Fact]
    public async Task EvaluateCapstoneAsync_Day90_MasterSubmission_PassesAndAwardsGraduationCertificate()
    {
        // Arrange
        var transcript = @"
            First, for the daily standup update: Yesterday I completed the outbox pattern implementation,
            and today I am reviewing our disaster recovery pipeline with no blockers.
            Next, in our architecture debate: I see your point regarding monolithic simplicity; however,
            from my perspective, the primary trade-off is our blast radius. By embracing domain-driven design
            with eventual consistency and idempotency, we safeguard system availability and meet our SLA.
            Finally, in our 1-on-1 career sync: I want to discuss our engineering roadmap and team bandwidth.
            My priority for next quarter is mentoring junior engineers while driving technical debt reduction.";

        var request = new CapstoneSubmissionRequest(
            DayNumber: 90,
            Transcript: transcript,
            DurationSeconds: 50,
            UserNotes: "Senior Master Capstone 3-in-1"
        );

        // Act
        var result = await _service.EvaluateCapstoneAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Scorecard.Passed.Should().BeTrue();
        result.Scorecard.OverallScore.Should().BeGreaterThanOrEqualTo(70);
        result.CertificateId.Should().NotBeNullOrWhiteSpace();
        result.CertificateId.Should().StartWith("CERT-DEVENG-D90-");
        result.CertificateTitle.Should().Be("Senior Engineering Communication Master Graduation Certificate");
        result.GraduationMessage.Should().Contain("graduated from the DevEng 90-Day Coach");
    }

    [Fact]
    public async Task EvaluateCapstoneAsync_BelowThresholdSubmission_FailsWithoutCertificate()
    {
        // Arrange - Minimal transcript with poor structure, no technical words, no ending consonants
        var transcript = "hello i talk now ok bye";
        var request = new CapstoneSubmissionRequest(
            DayNumber: 30,
            Transcript: transcript,
            DurationSeconds: 120, // very slow / poor WPM
            UserNotes: "Minimal attempt"
        );

        // Act
        var result = await _service.EvaluateCapstoneAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Scorecard.Passed.Should().BeFalse();
        result.Scorecard.OverallScore.Should().BeLessThan(70);
        result.CertificateId.Should().BeNull();
        result.CertificateTitle.Should().BeNull();
        result.GraduationMessage.Should().BeNull();
        result.Scorecard.Improvements.Should().NotBeEmpty();
    }
}
