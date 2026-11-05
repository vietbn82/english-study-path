namespace DevEngCoach.Common;

public sealed record DrillThresholdCheckRequest(
    int DayNumber,
    int TotalWordsCount,
    int CorrectWordsCount,
    IReadOnlyList<string> FailedWords,
    string TargetPhoneme
);

public sealed record DrillThresholdCheckResponse(
    bool ThresholdReached, // True if >= 70% (7/10)
    int AccuracyPercentage,
    bool AutoCompleted,
    string CelebrationMessage,
    IReadOnlyList<string> EnrolledInSrsWords,
    bool CanKeepGoing
);
