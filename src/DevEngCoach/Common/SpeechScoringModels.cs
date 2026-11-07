namespace DevEngCoach.Common;

public enum PhonemeCategory
{
    EndingConsonant,
    DentalFricative,
    PalatalAffricate,
    ConsonantCluster,
    Vowel
}

public sealed record PhonemeResult(
    string TargetPhoneme,
    string DetectedPhoneme,
    bool IsCorrect,
    PhonemeCategory Category,
    string KinestheticCorrectionTip
);

public sealed record SpeechScoreRequest(
    int DayNumber,
    string TargetWordOrSentence,
    string ExpectedPhonemes,
    string SpokenText
);

public sealed record CategoryScore(
    PhonemeCategory Category,
    int TotalCount,
    int CorrectCount,
    int AccuracyPercentage
);

public sealed record SpeechScoreResponse(
    int OverallAccuracy,
    bool IsPassing,
    IReadOnlyList<PhonemeResult> PhonemeBreakdown,
    bool AutoEnrolledInSrs,
    string FeedbackSummary
);

public sealed record DrillScoreRecord(
    string SessionId,
    DateTime Timestamp,
    int DayNumber,
    string TargetText,
    int OverallAccuracy,
    IReadOnlyList<CategoryScore> CategoryScores
);

public sealed record SpeechSummaryResponse(
    int TotalDrillsRecorded,
    int AverageAccuracy,
    IReadOnlyList<CategoryScore> CategoryPerformance,
    IReadOnlyList<string> CurrentWeakSpots
);

public sealed record SpeechTranscribeRequest(
    string? SpokenHint = null,
    string? TargetText = null,
    int DayNumber = 1,
    double? PeakAmplitude = null
);

public sealed record SpeechTranscribeResponse(
    string TranscribedText,
    double Confidence,
    bool IsSilent,
    bool IsVietnameseDetected,
    string? DiagnosticWarning = null
);
