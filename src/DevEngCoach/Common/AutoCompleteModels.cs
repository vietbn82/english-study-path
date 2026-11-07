using System.Text.Json.Serialization;

namespace DevEngCoach.Common;

[method: JsonConstructor]
public sealed record DrillThresholdCheckRequest(
    int DayNumber,
    int TotalWordsCount,
    int CorrectWordsCount = 0,
    IReadOnlyList<string>? FailedWords = null,
    string? TargetPhoneme = null,
    int ThresholdPercentage = 70,
    IReadOnlyList<string>? CorrectWords = null,
    int? CorrectFirstAttemptCount = null
)
{
    public DrillThresholdCheckRequest(
        int DayNumber,
        int TotalWordsCount,
        int CorrectFirstAttemptCount,
        int ThresholdPercentage,
        IReadOnlyList<string>? CorrectWords = null)
        : this(
            DayNumber: DayNumber,
            TotalWordsCount: TotalWordsCount,
            CorrectWordsCount: CorrectFirstAttemptCount,
            FailedWords: null,
            TargetPhoneme: null,
            ThresholdPercentage: ThresholdPercentage,
            CorrectWords: CorrectWords,
            CorrectFirstAttemptCount: CorrectFirstAttemptCount)
    {
    }

    public int EffectiveCorrectCount => CorrectFirstAttemptCount is > 0 ? CorrectFirstAttemptCount.Value : CorrectWordsCount;
}

[method: JsonConstructor]
public sealed record DrillThresholdCheckResponse(
    bool ThresholdReached, // True if >= configured threshold (default 70%)
    double AccuracyPercentage,
    bool AutoCompleted,
    string? CelebrationMessage,
    IReadOnlyList<string> EnrolledInSrsWords,
    bool CanKeepGoing = true,
    int RequiredWordsCount = 0,
    string CompletionMode = "AutoThreshold",
    IReadOnlyList<string>? NailedWords = null,
    int CurrentStreakDays = 0,
    bool DayMarkedComplete = false
)
{
    public DrillThresholdCheckResponse(
        bool ThresholdReached,
        double AccuracyPercentage,
        string? CelebrationMessage,
        bool DayMarkedComplete,
        int RequiredWordsCount = 0,
        string CompletionMode = "AutoThreshold",
        IReadOnlyList<string>? NailedWords = null,
        int CurrentStreakDays = 0)
        : this(
            ThresholdReached: ThresholdReached,
            AccuracyPercentage: AccuracyPercentage,
            AutoCompleted: DayMarkedComplete,
            CelebrationMessage: CelebrationMessage,
            EnrolledInSrsWords: [],
            CanKeepGoing: true,
            RequiredWordsCount: RequiredWordsCount,
            CompletionMode: CompletionMode,
            NailedWords: NailedWords ?? [],
            CurrentStreakDays: CurrentStreakDays,
            DayMarkedComplete: DayMarkedComplete)
    {
    }
}
