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

public sealed record AnalyticsOverview(
    BurndownData Burndown,
    IReadOnlyList<HeatmapCell> Heatmap,
    IReadOnlyList<StreakBadge> Badges,
    IReadOnlyList<WeeklyVelocity> Velocity
);
