using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IAnalyticsService
{
    Task<BurndownData> GetBurndownDataAsync(CancellationToken ct = default);
    Task<IReadOnlyList<HeatmapCell>> GetHeatmapGridAsync(CancellationToken ct = default);
    Task<IReadOnlyList<StreakBadge>> GetStreakBadgesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<WeeklyVelocity>> GetWeeklyVelocityAsync(CancellationToken ct = default);
    Task<AnalyticsOverview> GetOverviewAsync(CancellationToken ct = default);
    Task<CatchUpPlan> GetCatchUpPlanAsync(CancellationToken ct = default);
}
