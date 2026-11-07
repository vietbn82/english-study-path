namespace DevEngCoach.Common;

public sealed record BurndownPoint(
    int DayNumber,
    double IdealRemainingDays,
    double ActualRemainingDays
);

public sealed record BurndownData(
    IReadOnlyList<BurndownPoint> Points,
    int TotalDays,
    int CompletedDays,
    int ElapsedDays,
    int VarianceDays, // Positive = ahead of pace, negative = behind pace
    string PaceStatus,
    IReadOnlyList<int> SprintBoundaries
);

public sealed record HeatmapCell(
    int DayNumber,
    string DateIso,
    int ActualMinutes,
    int IntensityLevel, // 0 = 0m, 1 = 1-15m, 2 = 16-29m, 3 = 30m+
    int SelfRating,
    int SprintId,
    string Status
);

public sealed record StreakBadge(
    string BadgeId,
    string Name,
    string Emoji,
    int RequiredStreak,
    bool IsUnlocked,
    DateTime? UnlockedAt,
    string Description
);

public sealed record WeeklyVelocity(
    int WeekNumber,
    string WeekLabel,
    int SessionsCompleted,
    int TotalMinutes,
    double AverageMinutesPerSession,
    bool IsCurrentWeek
);

public sealed record BlockFrequencySummary(
    int PhoneticsDays,
    int FramesDays,
    int OutputDays,
    int FullSessionsCount,
    int PartialSessionsCount,
    int AudioOnlySessionsCount
);

public sealed record CatchUpDayItem(
    int DayNumber,
    int SprintId,
    string Title,
    string PhoneticTarget,
    int EstimatedMinutes,
    string RecommendedMode, // "Micro10m", "AudioOnly", "Standard15m"
    string FocusReason
);

public sealed record CatchUpPlan(
    bool IsBehind,
    int DaysBehind,
    int ElapsedDays,
    int CompletedDays,
    string PacingStatus, // "Ahead", "OnPace", "SlightlyBehind", "SeverelyBehind"
    string SuggestedStrategy, // "MicroCatchup", "WeekendSprint", "FastTrackAudio"
    int CatchUpDaysTarget,
    IReadOnlyList<CatchUpDayItem> PrioritizedCatchUpDays,
    string SeniorCoachAdvice
);

public sealed record AnalyticsOverview(
    BurndownData Burndown,
    IReadOnlyList<HeatmapCell> Heatmap,
    IReadOnlyList<StreakBadge> Badges,
    IReadOnlyList<WeeklyVelocity> Velocity,
    BlockFrequencySummary? BlockFrequency = null,
    CatchUpPlan? CatchUp = null
);
