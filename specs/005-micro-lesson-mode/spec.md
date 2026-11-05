# Feature Specification: Micro-Lesson Mode (10-Minute Escape Hatch)

**Feature Branch**: `005-micro-lesson-mode`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Some nights 30min feels impossible. Let the user pick just one of the 3 blocks (Phonetics / Frames / Output) as a 10-min micro-session. It still counts toward the streak (partial credit), killing the all-or-nothing psychology that causes skips."

---

## User Scenarios & Testing

### User Story 1 - Block Selector with Partial Credit (Priority: P1)

As a tired developer at 22:00 who can't commit to a full 30 minutes, I want to select just one of the three 10-minute blocks (Articulatory Drill, Sentence Frames, or AI Output) and have it count as a valid session toward my streak, so that I never skip a day entirely due to time pressure.

**Why this priority**: This is the core anti-skip mechanism. A skipped day breaks the streak and triggers abandonment. Partial credit preserves momentum.

**Independent Test**: Open the dashboard at Day 15, select "⚡ Quick 10min" mode, pick "Sentence Frames" block, complete it, and verify the day is marked as "Completed (Partial)" with the streak intact.

**Acceptance Scenarios**:

1. **Given** the user opens today's lesson, **When** they click "⚡ Quick 10min" instead of "Start Full Session", **Then** a block selector appears with 3 options: "🦷 Phonetics (10m)", "📝 Frames (10m)", "🎤 Output (10m)", each showing a brief description.
2. **Given** the user selects "📝 Frames" block, **When** the mini-session starts, **Then** only the Sentence Frame section loads with its own 10-minute timer, hiding the other two blocks.
3. **Given** the user completes the selected block, **When** they finish, **Then** the session is saved with `Status: CompletedPartial`, `ActualMinutes: ~10`, `BlocksCompleted: ["Frames"]`, and the streak counter increments normally.
4. **Given** the user completed a partial session and has time left, **When** they return to the lesson, **Then** the remaining blocks show as "Bonus" with a "Continue" button to optionally complete them (upgrading status to `Completed`).

---

### User Story 2 - Smart Block Recommendation (Priority: P2)

As a learner who doesn't know which block to pick on a busy night, I want the system to recommend the highest-impact block based on my recent weak spots, so that even a 10-minute session targets my biggest gap.

**Why this priority**: Eliminates decision fatigue at 22:00 when the learner is already tired.

**Independent Test**: With SRS data showing 5 weak phoneme words and 0 weak sentence frames, verify the system recommends "🦷 Phonetics" with reasoning "You have 5 phoneme weak spots to review."

**Acceptance Scenarios**:

1. **Given** the user's SRS queue has 5+ phoneme-related weak spots, **When** the block selector appears, **Then** "🦷 Phonetics" is highlighted as "⭐ Recommended" with tooltip "5 pronunciation weak spots need attention."
2. **Given** the user hasn't practiced Output/Speaking in 3+ days, **When** the block selector appears, **Then** "🎤 Output" is recommended with "You haven't spoken aloud in 3 days."
3. **Given** no clear recommendation exists, **When** the block selector appears, **Then** all three blocks show equally with no recommendation highlight.

---

### User Story 3 - Partial vs Full Session Analytics (Priority: P3)

As a learner reviewing my progress, I want to see which days were full sessions vs partial, and which blocks I tend to skip, so that I can identify patterns (e.g., "I always skip Phonetics on Fridays").

**Why this priority**: Self-awareness about learning patterns helps the user self-correct.

**Independent Test**: With 10 days of mixed full/partial sessions, verify the progress view distinguishes them and shows block completion frequency.

**Acceptance Scenarios**:

1. **Given** progress data has 7 full sessions and 3 partial sessions, **When** the heatmap renders, **Then** full sessions show as dark green, partial sessions show as yellow-green, with tooltip indicating "Partial: Frames only".
2. **Given** 10 days of data exist, **When** the user views analytics, **Then** a block frequency breakdown shows: "Phonetics: 8/10 days, Frames: 10/10 days, Output: 7/10 days."

---

### Edge Cases

- What if the user starts in Quick mode but finishes all 3 blocks? → Auto-upgrade to `Completed` (full).
- Can the user do 2 of 3 blocks? → Yes, mark as `CompletedPartial` with 2 blocks logged. Streak counts.
- Does a partial day count the same as a full day for badge milestones? → Yes, for streak continuity. Badge description notes "includes partial days."
- What if the user selects Quick mode every single day for 30 days? → Allowed. Show a gentle nudge after 5 consecutive partial days: "Great streak! Try a full session this weekend to level up faster."

## Requirements

### Functional Requirements

- **FR-001 (Block Selector UI)**: System MUST display a "⚡ Quick 10min" button alongside "▶️ Start Full Session (30m)" on the daily lesson view.
- **FR-002 (Individual Block Loading)**: System MUST load only the selected block's content and timer when in Quick mode, hiding other blocks to reduce visual clutter.
- **FR-003 (Partial Credit Persistence)**: System MUST save partial sessions with a new `CompletedPartial` status and a `BlocksCompleted` array field in session data.
- **FR-004 (Streak Continuity)**: `IProgressService` streak calculation MUST treat `CompletedPartial` identically to `Completed` for streak counting.
- **FR-005 (Block Recommendation Engine)**: System MUST analyze SRS weak spots and recent block completion history to recommend the highest-impact block.
- **FR-006 (Upgrade Path)**: After completing a partial session, the user MUST be able to continue with remaining blocks, upgrading the session status to `Completed`.
- **FR-007 (Gentle Nudge)**: After 5+ consecutive partial-only days, system SHOULD display a non-blocking encouragement to try a full session.

### Key Entities

Extends existing entities:
- **SessionLog** (modify): Add `BlocksCompleted` (string array: `["Phonetics", "Frames", "Output"]`), extend `Status` enum with `CompletedPartial`.
- **BlockRecommendation**: `RecommendedBlock`, `Reason`, `WeakSpotCount`, `DaysSinceLastPractice`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Skip Reduction)**: Days marked "Skipped" should decrease after this feature ships (measured over 2 weeks).
- **SC-002 (Quick Mode Latency)**: Time from clicking "⚡ Quick 10min" to starting the block is <2 seconds.
- **SC-003 (Streak Preservation)**: Partial sessions correctly extend streak with zero false streak-breaks in unit tests.

---

## Assumptions & Boundaries

- Minimum viable block is 1 of 3. No sub-block splitting (e.g., can't do "5 minutes of Phonetics").
- Block recommendation logic is simple heuristic (SRS count + recency), not ML.
- Existing timer UI adapts to 10-minute countdown when in Quick mode.
- No changes to the curriculum data model; blocks are derived from existing lesson structure (3 sections per day).
