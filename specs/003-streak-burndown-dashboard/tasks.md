# Task Breakdown: Streak & Burndown Analytics Dashboard

**Feature**: `003-streak-burndown-dashboard` | **Spec**: [spec.md](file:///E:/english/specs/003-streak-burndown-dashboard/spec.md) | **Plan**: [plan.md](file:///E:/english/specs/003-streak-burndown-dashboard/plan.md)

---

## Phase 1: Analytics Domain Models & Persistence

- [x] **Task 1.1**: Create `Common/AnalyticsModels.cs`:
  - `BurndownPoint`: `DayNumber`, `IdealRemaining`, `ActualRemaining`.
  - `BurndownData`: `Points` (List of `BurndownPoint`), `ElapsedDays`, `CompletedDays`, `VarianceDays` (+ ahead, - behind), `StatusMessage`.
  - `HeatmapCell`: `DayNumber`, `ScheduledDate`, `ActualMinutes`, `IntensityLevel` (0-3), `SelfRating`, `SprintId`, `Status`.
  - `StreakBadge`: `BadgeId`, `Name`, `Emoji`, `RequiredStreak`, `IsUnlocked`, `UnlockedAt`, `Description`.
  - `WeeklyVelocity`: `WeekNumber`, `StartDate`, `EndDate`, `SessionsCompleted`, `TotalMinutes`, `AverageMinutes`.
- [x] **Task 1.2**: Extend `ProgressSummary` and `progress.json` schema to persist unlocked badges and historical streaks.

---

## Phase 2: Analytics Calculation Engine

- [x] **Task 2.1**: Implement `IAnalyticsService` and `AnalyticsService`:
  - `GetBurndownDataAsync()`: Generates 90-day trajectory comparing linear 90→0 baseline with cumulative completions.
  - `GetHeatmapGridAsync()`: Maps all 90 days of curriculum to session logs, computing intensity levels (0=Skipped, 1=1-15m, 2=16-29m, 3=30m+).
  - `GetStreakBadgesAsync()`: Evaluates streak history against milestone thresholds (7, 30, 60, 90 days), unlocking and persisting new badges.
  - `GetWeeklyVelocityAsync()`: Aggregates sessions into calendar weeks with completion ratios and average durations.

---

## Phase 3: Minimal API Endpoints

- [x] **Task 3.1**: Register `IAnalyticsService` in `Program.cs`.
- [x] **Task 3.2**: Expose endpoints:
  - `GET /api/analytics/burndown`
  - `GET /api/analytics/heatmap`
  - `GET /api/analytics/badges`
  - `GET /api/analytics/velocity`

---

## Phase 4: Modern Dashboard UI & SVG Visualization

- [x] **Task 4.1**: Build Analytics Section in `wwwroot/index.html`:
  - Interactive Burndown Card with embedded SVG rendering line graphs, sprint boundary markers (Day 30, 60), and status delta badge.
  - GitHub-style 90-cell Heatmap Grid with responsive layout and hover tooltips showing day details.
  - Badges Trophy Shelf showcasing 🔥 7-day, ⭐ 30-day, 💎 60-day, and 👑 90-day achievements with glow effects.
  - Weekly Velocity Bar Chart displaying weekly output.
- [x] **Task 4.2**: Client-side rendering script in `wwwroot/app.js`:
  - SVG path generator for burndown curve.
  - Heatmap cell generator with dynamic tooltip positioning.
  - Confetti/glow trigger on newly unlocked badges.

---

## Phase 5: Automated Testing & Verification

- [x] **Task 5.1**: Author unit tests in `tests/DevEngCoach.Tests/AnalyticsServiceTests.cs`:
  - Test burndown data calculation across edge cases (0 days, mid-way behind, ahead of schedule).
  - Test heatmap cell intensity level assignment.
  - Test badge unlocking persistence and retention after broken streak.
  - Test weekly velocity aggregation.
- [x] **Task 5.2**: Integration tests for analytics endpoints in `tests/DevEngCoach.Tests/ApiIntegrationTests.cs`.
- [x] **Task 5.3**: Full build, execution, and verification with `dotnet test`.
