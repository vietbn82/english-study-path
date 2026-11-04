namespace DevEngCoach.Common;

public sealed record SessionLog(
    int DayNumber,
    DateTime ScheduledDate,
    DateTime? CompletedAt,
    int PlannedMinutes,
    int ActualMinutes,
    string Status, // "Completed", "Pending", "Skipped"
    int? SelfRating, // 1 to 5 stars
    string? LearnerNotes,
    string? AiFeedbackSnippet
);

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
    string? AiFeedbackSnippet
);
