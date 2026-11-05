# Feature Specification: Spaced Repetition Warm-Up

**Feature Branch**: `007-srs-warmup`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Start every session with a 2-minute quick-fire review of 5 weak words from previous days (pulled from SRS). This reinforces old material before loading new content, preventing the learn-and-forget cycle that kills motivation."

---

## User Scenarios & Testing

### User Story 1 - Automatic 2-Minute Warm-Up Before Every Session (Priority: P1)

As a learner starting my daily 30-minute session, I want the app to automatically present a 2-minute warm-up round of 5 words/phrases from my SRS weak-spot queue before showing today's new lesson, so that I reinforce previous material every single day without thinking about it.

**Why this priority**: The warm-up must be automatic and frictionless — if the learner has to opt-in or navigate to SRS manually, it won't happen consistently at 22:00 when they're tired.

**Independent Test**: Enroll 10 words in SRS, start a new session on Day 8, verify the warm-up screen appears first showing 5 due items with a 2-minute countdown before the main lesson loads.

**Acceptance Scenarios**:

1. **Given** the SRS queue has 5+ due items, **When** the user clicks "Start Session" (full or quick mode), **Then** a warm-up overlay appears showing the first word with prompt "How do you pronounce this?" and a 2:00 countdown timer.
2. **Given** the warm-up is active, **When** the user sees a word (e.g., `method`), **Then** they can: tap "🔊 Hear It" for reference audio, tap "✅ Got It" (promotes in SRS), or tap "❌ Forgot" (demotes in SRS), and the next word appears immediately.
3. **Given** the user completes all 5 words before 2 minutes, **When** the last word is answered, **Then** the warm-up ends early with "🎯 Warm-up complete!" and the main lesson loads automatically.
4. **Given** the 2-minute timer expires with 2 words remaining, **When** time runs out, **Then** the warm-up ends gracefully: "⏰ Time's up! 3/5 reviewed. Let's start today's lesson." Unreviewed items stay in the queue.
5. **Given** the SRS queue has 0 due items, **When** the user starts a session, **Then** the warm-up is skipped entirely with no interruption — lesson loads directly.

---

### User Story 2 - Smart Word Selection from SRS Queue (Priority: P2)

As a learner, I want the warm-up to prioritize words I've struggled with most (lowest SRS box / most recent failures), mixed with one word I almost know (reinforcement), so that the 2 minutes are maximally effective.

**Why this priority**: Random selection wastes time on words the learner already knows. Prioritized selection targets the biggest gaps.

**Independent Test**: With SRS items in boxes 1-5, verify the warm-up selects 3 items from box 1 (weakest), 1 from box 2, and 1 from box 3-5 (reinforcement).

**Acceptance Scenarios**:

1. **Given** 20 SRS items across boxes 1-5, **When** warm-up selects 5 items, **Then** selection follows: 3 from the lowest populated box (most struggled), 1 from the next box, 1 from a higher box (reinforcement/confidence boost).
2. **Given** only 3 items exist in SRS total, **When** warm-up loads, **Then** it shows all 3 items and completes early — no padding with empty slots.
3. **Given** all SRS items are in box 5 (well-known), **When** warm-up selects, **Then** it picks 5 random items from box 5 with a header "Quick confidence check! 💪".

---

### User Story 3 - Warm-Up Results Summary (Priority: P3)

As a learner, I want a brief summary after the warm-up showing how I did (e.g., "4/5 correct, 1 word demoted") and which word I should pay extra attention to in today's lesson, so that I enter the lesson with awareness of my current weak spot.

**Why this priority**: Closes the feedback loop between warm-up and lesson, creating a coherent learning flow.

**Independent Test**: Complete warm-up with 4 correct and 1 incorrect, verify summary shows the results and highlights the failed word.

**Acceptance Scenarios**:

1. **Given** the warm-up is complete with results [✅, ✅, ❌, ✅, ✅], **When** the summary renders, **Then** it shows: "4/5 correct! 📌 Focus word today: **method** (/ˈmɛθ.əd/) — remember: tongue between teeth for /θ/."
2. **Given** the user got 5/5 correct, **When** the summary renders, **Then** it shows: "Perfect warm-up! 🔥 All 5 words solid. Let's learn something new."

---

### Edge Cases

- What if the user is on Day 1 (no previous SRS data)? → Skip warm-up entirely; no items to review.
- What if the user skips the warm-up manually? → Provide a small "Skip Warm-Up ⏭️" button, but log the skip. Show warm-up skip count in analytics.
- What about warm-up in Quick/Micro mode (10min)? → Warm-up still plays but shortened to 1 minute / 3 words to preserve time budget.
- What if the same word appears in warm-up AND today's lesson? → Fine — double exposure reinforces. No deduplication needed.

## Requirements

### Functional Requirements

- **FR-001 (Auto-Trigger)**: Warm-up MUST automatically launch before every session start (full or quick mode) when the SRS queue has ≥1 due item.
- **FR-002 (5-Word Queue)**: Warm-up MUST present exactly 5 items (or fewer if queue is smaller), selected via priority algorithm from `ISrsService.GetDueItems()`.
- **FR-003 (2-Minute Timer)**: Warm-up MUST display a countdown timer starting at 2:00. Timer is informational (not enforced hard-stop for MVP).
- **FR-004 (Got It / Forgot Actions)**: Each warm-up item MUST support binary feedback: "✅ Got It" (calls `ISrsService.RecordReview` with `Correct: true`) and "❌ Forgot" (calls with `Correct: false`).
- **FR-005 (Audio Playback)**: Each warm-up item MUST show a "🔊 Hear It" button playing the word's reference pronunciation.
- **FR-006 (Priority Selection Algorithm)**: Selection MUST weight items by SRS box (lower box = higher priority) with at least 1 reinforcement item from a higher box.
- **FR-007 (Skip Option)**: A "Skip ⏭️" button MUST be available but visually de-emphasized.
- **FR-008 (Quick Mode Adaptation)**: In Quick/Micro mode, warm-up MUST reduce to 1 minute / 3 words.
- **FR-009 (Results Summary)**: After warm-up completion, a brief summary MUST display before transitioning to the main lesson.
- **FR-010 (Warm-Up Metrics)**: System MUST log warm-up completion rate, accuracy, and skips in session data.

### Key Entities

- **WarmUpSession**: `DayNumber`, `ItemsPresented` (int), `ItemsCorrect` (int), `ItemsSkipped` (int), `Duration` (seconds), `FocusWord` (weakest item), `WasSkipped` (bool).
- **WarmUpItem**: `SrsItemId`, `WordOrPhrase`, `IpaTranscription`, `SrsBox`, `UserResult` (GotIt/Forgot/Unanswered).

Extends existing entities:
- **SessionLog** (extend): Add `WarmUpResults` (optional WarmUpSession object).

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Auto-Launch Rate)**: Warm-up launches automatically for 100% of sessions where SRS queue is non-empty.
- **SC-002 (Completion Speed)**: Average warm-up completes in <90 seconds (target: quick-fire pace).
- **SC-003 (SRS Integration)**: "Got It" / "Forgot" actions correctly update SRS box positions (verified by unit tests).
- **SC-004 (Skip Rate)**: Warm-up skip rate stays below 20% (indicates it's not annoying).

---

## Assumptions & Boundaries

- Warm-up uses existing `ISrsService` API — no new backend endpoints needed for item retrieval and review recording.
- Reference audio uses the same source as the main lesson (TTS or pre-recorded).
- The warm-up UI is a modal overlay on the lesson page, not a separate route/page.
- Timer is soft (shows remaining time) not hard (doesn't force-close). Users can take longer if needed.
- Warm-up items show the word, IPA, and a brief kinesthetic hint — not the full contrastive diagram (that's in the main lesson).
