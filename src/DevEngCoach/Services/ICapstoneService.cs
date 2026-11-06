namespace DevEngCoach.Services;

/// <summary>
/// Domain service for Milestone Capstone assessments at Day 30, Day 60, and Day 90.
/// </summary>
public interface ICapstoneService
{
    /// <summary>
    /// Gets the capstone rubric specification for a designated milestone day (30, 60, or 90).
    /// </summary>
    CapstoneSpec GetCapstoneSpec(int day);

    /// <summary>
    /// Evaluates a user capstone audio/transcript submission against the milestone rubric.
    /// </summary>
    Task<CapstoneEvaluationResult> EvaluateCapstoneAsync(CapstoneSubmissionRequest request, CancellationToken ct = default);
}

/// <summary>
/// Specification, time limits, and rubric targets for a milestone capstone.
/// </summary>
public record CapstoneSpec(
    int DayNumber,
    string Title,
    string MilestoneName,
    int TimeLimitSeconds,
    string TargetScenario,
    List<string> FocusPhonetics,
    List<string> EvaluationCriteria,
    string PassingStandard);

/// <summary>
/// Submission payload for milestone capstone evaluation.
/// </summary>
public record CapstoneSubmissionRequest(
    int DayNumber,
    string Transcript,
    int DurationSeconds,
    string UserNotes);

/// <summary>
/// Detailed evaluation scorecard across the four core dimensions of engineering speech.
/// </summary>
public record CapstoneScorecard(
    int OverallScore,
    int PhoneticScore,
    int FluencyPacingScore,
    int SentenceStructureScore,
    int TechnicalVocabScore,
    bool Passed,
    string RubricFeedback,
    List<string> Strengths,
    List<string> Improvements);

/// <summary>
/// Complete evaluation result including scorecard, optional certificate ID, and graduation message.
/// </summary>
public record CapstoneEvaluationResult(
    bool Success,
    CapstoneScorecard Scorecard,
    string? CertificateId,
    string? CertificateTitle,
    string? GraduationMessage);
