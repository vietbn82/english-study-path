namespace DevEngCoach.Common;

public sealed record ShadowingEvaluateRequest(
    int DayNumber,
    string TargetSentence,
    double ReferenceDurationSeconds,
    double UserDurationSeconds,
    string? UserTranscript = null,
    int DetectedPauseCount = 0
);

public sealed record ShadowingFeedbackResponse(
    int PacingScore, // 0-100
    string PacingDiagnosis, // "Optimal", "Rushed", "Lagging"
    double SpeedRatio, // UserDuration / ReferenceDuration
    string StressTimingTip,
    IReadOnlyList<string> ArticulatoryAlerts,
    string ActionableRecommendation
);

public sealed record ReferenceAudioInfo(
    int DayNumber,
    string SentenceFrame,
    string PhoneticGuide,
    double TargetDurationSeconds,
    string AudioMode // "TTS" or "Recorded"
);
