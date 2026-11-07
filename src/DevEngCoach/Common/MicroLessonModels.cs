namespace DevEngCoach.Common;

public sealed record MicroSessionRequest(
    int DayNumber,
    string SelectedBlock, // "Phonetics", "Frames", "Output"
    int ActualMinutes,
    int? SelfRating = null,
    string? LearnerNotes = null
);

public sealed record MicroSessionResponse(
    bool Success,
    int DayNumber,
    string SelectedBlock,
    int CurrentStreakDays,
    string Status, // "CompletedPartial"
    string Message
);

public sealed record BlockRecommendation(
    string RecommendedBlock, // "Phonetics", "Frames", "Output"
    string ReasonVi,
    int PriorityWeight = 1,
    int WeakSpotCount = 0,
    int DaysSinceLastSpeaking = 0,
    bool ShowConsecutivePartialNudge = false,
    int EstimatedMinutes = 5
)
{
    public string Reason => ReasonVi;
}
