# Implementation Plan: Streak & Burndown Analytics Dashboard

**Branch**: `003-streak-burndown-dashboard` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/003-streak-burndown-dashboard/spec.md)

---

## 1. Summary

Implement a **Streak & Burndown Analytics Dashboard** providing visual, data-driven feedback on 90-day curriculum completion. The feature includes:
1. An SVG-rendered **Burndown Line Chart** (Day 1 → 90) contrasting ideal linear pace against actual completed days with a dynamic ahead/behind variance indicator and Sprint 1/2/3 boundary markers.
2. A GitHub-style **Heatmap Calendar** (90 cells, 13 weeks × 7 days) color-coded by study intensity (minutes logged per day).
3. A **Gamified Streak Engine** with milestone achievement badges (🔥 7-day, ⭐ 30-day, 💎 60-day, 👑 90-day) persisted permanently in `Data/progress.json`.
4. A **Weekly Velocity Metric** summarizing completed sessions and average daily minutes per ISO week.

---

## 2. Technical Context

- **Framework**: .NET 10 Minimal API (C# 13, Primary Constructors, File-Scoped Namespaces)
- **Frontend**: Zero-build vanilla JS + HTML5 Canvas / SVG (no heavy third-party bundle) + Tailwind CSS
- **Storage**: Extended `Data/progress.json` with badge unlocks and session history
- **Testing**: xUnit + FluentAssertions + Microsoft.AspNetCore.Mvc.Testing
- **Integration Points**: `IProgressService` and `ICurriculumService`
- **Performance Goals**: Analytics generation < 10ms, chart render < 60fps, zero layout shift
- **Constraints**: Pure client-side SVG rendering (zero server-side graphics generation); responsive down to 1366×768.

---

## 3. Constitution Check

- [x] **Principle I: Product Purpose Inviolability**: Every graph directly maps to the 90-day technical roadmap milestones.
- [x] **Principle II: Zero-Friction & Zero-Research**: Telemetry is automatically derived from daily completed sessions.
- [x] **Principle III: Kinesthetic Articulatory Primacy**: Reinforces consistency needed for muscle memory crystallization.
- [x] **Principle IV: Chunk-Based Functional Synthesis**: Badges align with Sprint milestones (Sprint 1: Standup, Sprint 2: Demo, Sprint 3: Workplace Debate).
- [x] **Principle V: Clean .NET Architecture**: Strict domain separation, immutable record types, comprehensive test coverage.

---

## 4. Architecture & Component Design

```text
E:\english\
├── specs\003-streak-burndown-dashboard\
│   ├── spec.md                     # Feature requirements
│   ├── plan.md                     # This plan
│   └── tasks.md                    # Actionable work breakdown
├── src\DevEngCoach\
│   ├── Common\
│   │   └── AnalyticsModels.cs      # BurndownPoint, HeatmapCell, BadgeRecord, WeeklyVelocity
│   ├── Services\
│   │   ├── IAnalyticsService.cs    # Contract for burndown, heatmap, badges, velocity
│   │   └── AnalyticsService.cs     # Analytics calculation engine
│   ├── Program.cs                  # Endpoints (/api/analytics/*)
│   └── wwwroot\
│       ├── index.html              # Analytics view container (Burndown, Heatmap, Badges)
│       ├── app.js                  # SVG Chart renderer, heatmap generator & animations
│       └── styles.css              # Badge unlock animations & heatmap cell styling
└── tests\DevEngCoach.Tests\
    └── AnalyticsServiceTests.cs    # xUnit + FluentAssertions unit tests
```

---

## 5. API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/burndown` | Returns ideal vs actual remaining days points, ahead/behind delta, sprint markers |
| `GET` | `/api/analytics/heatmap` | Returns 90-day grid with date, minutes, intensity level, and rating |
| `GET` | `/api/analytics/badges` | Returns badge catalog (🔥 7d, ⭐ 30d, 💎 60d, 👑 90d) with unlock timestamps |
| `GET` | `/api/analytics/velocity` | Returns ISO week breakdown of sessions completed and average minutes |

---

## 6. Verification Plan

1. **Unit Tests (`AnalyticsServiceTests.cs`)**:
   - Burndown calculation: 20 completed sessions over 30 days -> actual = 70, behind by 10 days.
   - Ahead of pace calculation: 25 completed in 20 days -> ahead by 5 days.
   - Heatmap cell intensity: 0m -> level 0, 15m -> level 1, 25m -> level 2, 35m -> level 3.
   - Badge unlocking logic: 7-day streak unlocks 🔥 badge; skipping resets current streak but retains unlocked badge.
   - Weekly velocity aggregation: correctly partitions sessions into ISO weeks.
2. **API Integration Tests**:
   - Verify `/api/analytics/burndown` and `/api/analytics/heatmap` return valid JSON.
3. **Frontend Visual Verification**:
   - Inspect SVG burndown curve, 90-cell heatmap grid tooltips, and badge unlock showcase in browser.
