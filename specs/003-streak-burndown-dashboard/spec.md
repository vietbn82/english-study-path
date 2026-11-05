# Feature Specification: Streak & Burndown Analytics Dashboard

**Feature Branch**: `003-streak-burndown-dashboard`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Visual burndown chart (Day 1→90) with heatmap calendar, actual vs planned minutes, and weekly velocity. Gamify with streak badges (🔥7-day, ⭐30-day)."

---

## User Scenarios & Testing

### User Story 1 - Burndown Chart with Plan vs Actual (Priority: P1)

As a learner on Day 25 of my 90-day plan, I want to see a visual burndown chart showing my remaining days plotted against ideal pace, with actual completed days overlaid, so that I can immediately tell if I'm on track, ahead, or behind schedule.

**Why this priority**: The burndown is the primary motivational feedback loop — a single glance tells the learner their trajectory. Without it, progress feels abstract.

**Independent Test**: With 15 of 25 days completed, load the dashboard and verify the burndown chart shows: ideal line (90→0 over 90 days), actual line (90→75 at day 25), and a clear "Behind by 10 days" indicator.

**Acceptance Scenarios**:

1. **Given** progress data exists with 20 completed sessions out of 30 elapsed days, **When** the user opens the analytics view, **Then** a line chart renders with an ideal diagonal (90→0), an actual progress line (90→70), and a delta annotation showing "10 days behind pace".
2. **Given** the user is ahead of schedule (25 completed in 20 elapsed days), **When** the chart renders, **Then** the actual line is above the ideal line with a green "5 days ahead" badge.
3. **Given** no sessions have been completed yet, **When** the chart renders, **Then** it shows only the ideal line with a prompt "Complete your first session to see progress!".

---

### User Story 2 - Heatmap Calendar (Priority: P2)

As a learner, I want a GitHub-style contribution heatmap showing all 90 days in a grid, color-coded by completion status and study intensity (minutes spent), so that I can spot patterns like weekend gaps or consistent daily habits at a glance.

**Why this priority**: Heatmaps create social-proof-style visual pressure and make gaps viscerally obvious, reinforcing the daily habit.

**Independent Test**: With mixed completion data (some days completed at 30min, some at 15min, some skipped), verify the heatmap renders with distinct color intensities and correct day labels.

**Acceptance Scenarios**:

1. **Given** progress data spans Days 1–30 with varying actual minutes (0, 15, 25, 30, 45), **When** the heatmap renders, **Then** each day cell shows intensity: gray (0/Skipped), light green (1-15min), medium green (16-29min), dark green (30min+), with tooltip showing "Day N: Xm / 30m planned".
2. **Given** today is Day 35, **When** the heatmap renders, **Then** Days 1-35 are colored by status, Days 36-90 are rendered as empty/future cells with lighter borders.
3. **Given** the user hovers over a completed day cell, **When** the tooltip appears, **Then** it shows: Day number, date, actual minutes, self-rating, and sprint name.

---

### User Story 3 - Streak Tracking with Gamification Badges (Priority: P3)

As a learner, I want to see my current streak prominently displayed with milestone badges (🔥 7-day, ⭐ 30-day, 💎 60-day, 👑 90-day), and receive a visual celebration when I hit a milestone, so that I feel rewarded for consistency.

**Why this priority**: Gamification badges exploit loss aversion — once a streak is built, the psychological cost of breaking it reinforces the habit.

**Independent Test**: Set progress data to exactly 7 consecutive completed days, load the dashboard, verify the 🔥 7-day badge is displayed with an unlock animation.

**Acceptance Scenarios**:

1. **Given** the user has completed 7 consecutive days, **When** the dashboard loads, **Then** the streak section shows "🔥 7-Day Streak!" with the badge unlocked and a brief confetti animation on first view.
2. **Given** the user had a 12-day streak but skipped yesterday, **When** the dashboard loads, **Then** current streak shows "0 days" with the previous best streak "12 days" preserved, and the 🔥 badge remains unlocked (earned permanently).
3. **Given** the user has completed exactly 30 consecutive days, **When** Day 30 is marked complete, **Then** the ⭐ 30-day badge unlocks with a milestone celebration card: "Sprint 1 Complete! You've mastered Daily Standup fundamentals."
4. **Given** no sessions have been completed, **When** the dashboard loads, **Then** all badges show as locked/grayed out with "Complete N more days" labels.

---

### User Story 4 - Weekly Velocity Metrics (Priority: P3)

As a learner reviewing my weekly rhythm, I want to see a bar chart of sessions completed per week and average daily study minutes per week, so that I can identify my strongest and weakest weeks.

**Why this priority**: Weekly aggregation reveals trends that daily data obscures (e.g., consistently dropping off on weekends).

**Independent Test**: With 3 weeks of data, verify the weekly bar chart shows 3 bars with correct session counts and average minutes.

**Acceptance Scenarios**:

1. **Given** 3 weeks of progress data (Week 1: 6/7 days, avg 28min; Week 2: 4/7 days, avg 22min; Week 3: 7/7 days, avg 31min), **When** the velocity chart renders, **Then** 3 bars display with labels, heights proportional to sessions completed, and average minutes annotated.
2. **Given** the current week is incomplete (3 of 5 elapsed days completed), **When** the chart renders, **Then** the current week bar is visually distinct (dashed outline) with "(in progress)" label.

---

### Edge Cases

- What happens when the user resets progress? → All charts clear and badges reset to locked state.
- How are days before the app was installed handled? → Days before first session are shown as "Not Started" (neutral gray), not "Skipped".
- What if the user completes multiple sessions in one day? → Only the best/latest session counts; total minutes are summed.
- What about timezone changes? → All dates use local machine time, consistent with existing `ProgressService`.

## Requirements

### Functional Requirements

- **FR-001 (Burndown Chart)**: System MUST render an SVG/Canvas line chart with ideal pace line (linear 90→0) and actual progress line, updated on every page load from existing `IProgressService.GetSummary()`.
- **FR-002 (Heatmap Calendar)**: System MUST render a 90-cell grid (13 weeks × 7 days) color-coded by completion intensity, using data from `IProgressService.GetAllSessions()`.
- **FR-003 (Streak Engine)**: System MUST calculate current streak, longest streak, and badge milestones (7, 30, 60, 90 days) from session completion dates.
- **FR-004 (Badge Persistence)**: System MUST persist unlocked badges so they remain earned even after a streak breaks. Store in existing `progress.json`.
- **FR-005 (Weekly Velocity)**: System MUST aggregate sessions into ISO weeks and calculate: sessions completed, total minutes, average minutes per session.
- **FR-006 (Client-Side Rendering)**: All charts MUST render client-side using lightweight JS (vanilla Canvas/SVG or a micro-library like Chart.js). No server-side image generation.
- **FR-007 (Responsive Layout)**: Analytics section MUST fit within the existing dashboard layout on a 1920×1080 screen without horizontal scrolling.
- **FR-008 (Sprint Annotations)**: Burndown chart MUST show vertical markers at Day 30 and Day 60 indicating Sprint boundaries with labels.

### Key Entities

- **BadgeDefinition**: `BadgeId`, `Name`, `Emoji`, `RequiredStreak`, `Description`, `SprintAlignment`.
- **UnlockedBadge**: `BadgeId`, `UnlockedAt`, `StreakAtUnlock`.
- **WeeklyVelocity**: `WeekNumber`, `StartDate`, `EndDate`, `SessionsCompleted`, `TotalMinutes`, `AverageMinutes`.

Extends existing entities:
- **ProgressSummary** (add): `LongestStreak`, `UnlockedBadges[]`, `WeeklyVelocities[]`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Chart Render Time)**: Burndown chart and heatmap render in <500ms on page load with 90 days of data.
- **SC-002 (Visual Accuracy)**: Burndown ideal vs actual lines correctly reflect data from `progress.json` with zero off-by-one errors on day counts.
- **SC-003 (Streak Correctness)**: Streak calculation matches manual count of consecutive completed days (verified by unit tests with edge cases: gaps, resets, same-day duplicates).
- **SC-004 (Motivation Impact)**: Badge unlock animations trigger exactly once per milestone (not on every page reload).

---

## Assumptions & Boundaries

- Charts are rendered client-side in the existing `index.html` or a new `analytics.html` page.
- No external charting CDN; either vanilla SVG/Canvas or a vendored micro-library bundled in `wwwroot/`.
- Badge definitions are hardcoded (not user-configurable) matching the 4 milestones: 7, 30, 60, 90.
- The backend exposes existing progress data; minimal new endpoints needed (possibly `/api/progress/analytics` for pre-computed aggregates).
- Weekly velocity uses ISO 8601 week numbering starting from the user's first session date.
