namespace DevEngCoach.Common;

public sealed record SessionLog(
    int DayNumber,
    DateTime ScheduledDate,
    DateTime? CompletedAt,
    int PlannedMinutes,
    int ActualMinutes,
    string Status, // "Completed", "CompletedPartial", "Pending", "Skipped"
    int? SelfRating, // 1 to 5 stars
    string? LearnerNotes,
    string? AiFeedbackSnippet,
    string? SessionMode = "Visual",
    string? CompletedBlock = null,
    IReadOnlyList<string>? BlocksCompleted = null,
    string? CompletionMode = "Manual"
)
{
    public string DateCompleted => (CompletedAt ?? ScheduledDate).ToString("yyyy-MM-dd");
}

public sealed record ProgressSummary(
    int CurrentStreakDays,
    int LongestStreakDays,
    int TotalCompletedDays,
    int TotalPlannedDays,
    int TotalActualMinutesSpent,
    int TotalPlannedMinutesExpected,
    int VarianceMinutes,
    double CompletionPercentage,
    int NextDayNumber
);

public sealed record CompleteSessionRequest(
    int DayNumber,
    int ActualMinutes,
    int? SelfRating,
    string? LearnerNotes,
    string? AiFeedbackSnippet,
    string? SessionMode = "Visual"
);
