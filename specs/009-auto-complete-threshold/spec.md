# Feature Specification: "Good Enough" Auto-Complete Threshold

**Feature Branch**: `009-auto-complete-threshold`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "After the user successfully pronounces 7/10 words in a drill, auto-mark the session as ✅ Complete with a congratulatory message. Don't force perfection. The remaining 3 weak words auto-enroll in SRS for tomorrow. Prevents the 'I'll never finish this' paralysis."

---

## User Scenarios & Testing

### User Story 1 - Auto-Complete at 70% Threshold (Priority: P1)

As a tired learner at 22:00 who just pronounced 7 out of 10 words correctly in a drill, I want the system to automatically mark my session as complete with a congratulatory message, so that I feel accomplished and don't get stuck trying to perfect the last 3 words tonight.

**Why this priority**: Perfectionism is the #1 session-killer. Learners who feel they "can't finish" stop trying entirely. Auto-complete at 70% converts a potential skip into a win.

**Independent Test**: Start a 10-word pronunciation drill, intentionally get 7 correct and 3 wrong, verify the system auto-triggers completion with "🎉 Session complete! 7/10 — great work!" without requiring the user to manually click Complete.

**Acceptance Scenarios**:

1. **Given** a drill has 10 target words, **When** the user correctly pronounces the 7th word (70% threshold reached), **Then** a celebration banner appears: "🎉 Great work! 7/10 correct — session complete! The remaining words will appear in tomorrow's warm-up."
2. **Given** auto-complete triggers at 7/10, **When** the session is saved, **Then** `Status` is set to `Completed`, `ActualMinutes` reflects real time spent, and a `CompletionMode: AutoThreshold` flag is recorded.
3. **Given** auto-complete has triggered, **When** the user still wants to continue, **Then** a "Keep Going 💪" button is visible, allowing them to attempt the remaining 3 words without pressure. The session stays `Completed` regardless.
4. **Given** the user gets 10/10 correct, **When** the last word is answered, **Then** a stronger celebration: "🏆 Perfect score! 10/10 — flawless session!" with the session marked `Completed` and `CompletionMode: Perfect`.

---

### User Story 2 - Auto-Enroll Failed Words into SRS (Priority: P1)

As a learner, I want the 3 words I got wrong to automatically appear in my SRS weak-spot queue and in tomorrow's warm-up, so that I don't lose them and they come back for reinforcement without any manual effort.

**Why this priority**: Equal priority to auto-complete because together they form the complete loop: celebrate success AND capture failures. One without the other is incomplete.

**Independent Test**: Fail 3 words in a drill, verify all 3 appear in the SRS queue via `/api/srs/queue` within the same session.

**Acceptance Scenarios**:

1. **Given** the user fails words `method`, `deployment`, `scripts` in a drill, **When** auto-complete triggers, **Then** all 3 words are enrolled into SRS via `ISrsService.AutoEnrollWeakSpot()` with source `DrillAutoEnroll` and the day's lesson context.
2. **Given** the word `method` is already in the SRS queue (from a previous day), **When** it fails again, **Then** it is demoted (moved to a lower box) rather than duplicated.
3. **Given** the user clicks "Keep Going" and subsequently gets `method` correct, **When** the additional attempt succeeds, **Then** the SRS enrollment stands but the review is recorded as correct, starting the recovery path.

---

### User Story 3 - Configurable Threshold (Priority: P3)

As a learner who wants to challenge myself more (or less), I want to adjust the auto-complete threshold (e.g., 60%, 70%, 80%) in settings, so that I can calibrate difficulty to my current energy level.

**Why this priority**: Different learners and different nights call for different thresholds. Configurability prevents the feature from feeling patronizing to motivated learners.

**Independent Test**: Change threshold to 80% in settings, run a 10-word drill, verify auto-complete triggers at 8/10 instead of 7/10.

**Acceptance Scenarios**:

1. **Given** the user opens Settings, **When** they adjust the "Auto-Complete Threshold" slider, **Then** options are: 60% (Easy night), 70% (Default), 80% (Challenge mode), 90% (Almost perfect), with the current selection highlighted.
2. **Given** the threshold is set to 80%, **When** the user gets 7/10 correct in a drill, **Then** auto-complete does NOT trigger. The user must reach 8/10 or manually mark complete.
3. **Given** the threshold is set to 60%, **When** the user gets 6/10 correct, **Then** auto-complete triggers with the standard celebration.

---

### User Story 4 - Session Completion Summary Card (Priority: P2)

As a learner, I want a brief end-of-session summary showing: words nailed, words to review, today's phoneme focus, and streak count, so that I close the session with a clear picture of progress.

**Why this priority**: The summary card is the emotional closing of the session. A positive ending increases the likelihood of returning tomorrow.

**Independent Test**: Complete a session with 8/10 correct, verify the summary card shows correct words in green, failed words in orange with SRS enrollment confirmation, and updated streak.

**Acceptance Scenarios**:

1. **Given** auto-complete triggers with 7/10 correct, **When** the summary card renders, **Then** it shows: ✅ Nailed (7 words listed in green), 📌 Review Tomorrow (3 words in orange with brief phoneme hint), 🔥 Streak: N days, ⏱️ Time: X minutes.
2. **Given** a perfect 10/10 session, **When** the summary renders, **Then** all words are green, "Review Tomorrow" section is absent, and an extra "🏆 Perfect!" badge is shown.
3. **Given** the user clicked "Keep Going" after auto-complete and corrected 1 more word, **When** the final summary renders, **Then** it shows 8/10 with the corrected word moved from orange to green, and only 2 words enrolled in SRS.

---

### Edge Cases

- What if a drill has fewer than 10 words (e.g., 5 words)? → Threshold applies proportionally: 70% of 5 = 3.5, round down to 3 words needed.
- What if the user gets 0/10? → No auto-complete. Show encouragement: "Tough one! Focus on the phonetics block first, then try the drill again."
- What about sentence frame drills (not just word drills)? → Same threshold logic applies. Each sentence frame attempt counts as 1 item.
- Does auto-complete affect the session rating? → No. The user can still self-rate the session (1-5 stars) independently.
- What if auto-complete is off (user disabled it)? → All manual. User clicks "Mark Complete" whenever they decide.

## Requirements

### Functional Requirements

- **FR-001 (Threshold Detection)**: System MUST track correct/incorrect count during a drill in real-time and trigger auto-complete when correct count reaches the configured threshold percentage of total items.
- **FR-002 (Default Threshold)**: Default auto-complete threshold MUST be 70% (configurable per FR-005).
- **FR-003 (Celebration UI)**: Auto-complete MUST display an immediate, non-blocking celebration banner with score, encouragement, and "Keep Going" option.
- **FR-004 (SRS Auto-Enroll on Failure)**: Every word/phrase marked incorrect in a drill MUST be auto-enrolled into SRS via `ISrsService.AutoEnrollWeakSpot()`, with deduplication for existing entries.
- **FR-005 (Configurable Threshold)**: User MUST be able to set threshold to 60%, 70%, 80%, or 90% via a settings UI. Stored in local settings/preferences.
- **FR-006 (Keep Going Mode)**: After auto-complete, remaining unanswered items MUST still be attemptable. Additional correct answers update the summary but do NOT change the `Completed` status.
- **FR-007 (Completion Mode Tracking)**: Session data MUST record `CompletionMode`: `AutoThreshold`, `Perfect`, `Manual`, or `CompletedPartial` (from micro-lesson).
- **FR-008 (Summary Card)**: End-of-session summary MUST show: correct words (green), failed words (orange) with SRS enrollment confirmation, streak count, and session duration.
- **FR-009 (Proportional Threshold)**: For drills with N items, threshold = `floor(N × threshold_percentage)`. Minimum threshold is 1 correct word.

### Key Entities

- **DrillResult**: `DayNumber`, `DrillType` (Word/Sentence), `TotalItems`, `CorrectCount`, `FailedItems[]`, `CompletionMode`, `ThresholdUsed`, `KeptGoing` (bool).
- **UserSettings** (new or extend): `AutoCompleteThreshold` (0.6 | 0.7 | 0.8 | 0.9), `AutoCompleteEnabled` (bool, default: true).

Extends existing entities:
- **SessionLog** (extend): Add `DrillResults[]` (array of DrillResult), `CompletionMode`.
- **SrsEnrollRequest** (extend): Add optional `Source` field ("DrillAutoEnroll", "ManualEnroll", "WarmUpDemote").

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Completion Rate Increase)**: Sessions marked `Completed` (including auto-threshold) should increase compared to baseline (before feature).
- **SC-002 (Skip Reduction)**: Days marked `Skipped` should decrease, as more sessions reach "good enough" status.
- **SC-003 (SRS Enrollment Accuracy)**: 100% of failed drill words are enrolled in SRS with no duplicates (verified by unit tests).
- **SC-004 (Threshold Correctness)**: Auto-complete triggers at exactly the configured threshold for all drill sizes 3-15 (verified by unit tests with edge cases).

---

## Assumptions & Boundaries

- Auto-complete applies to pronunciation drills and sentence frame drills. Does not apply to warm-up (which has its own flow).
- "Correct" vs "Incorrect" is determined by the existing AI evaluation or user self-assessment — this spec doesn't change the evaluation mechanism.
- The celebration banner uses CSS animation (confetti/fade-in), no external animation library.
- Threshold setting persists in `localStorage` or a `settings.json` file alongside `progress.json`.
- This feature works independently of `005-micro-lesson-mode` but composes well with it (partial session + auto-complete = maximum anti-skip protection).
