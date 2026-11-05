# Task Breakdown: Local Learning Dashboard & Pre-compiled Curriculum Manager

**Feature**: `001-local-learning-dashboard` | **Spec**: [spec.md](file:///E:/english/specs/001-local-learning-dashboard/spec.md) | **Plan**: [plan.md](file:///E:/english/specs/001-local-learning-dashboard/plan.md)

---

## Phase 1: Solution Scaffolding & Domain Models (Foundational)

- [x] **Task 1.1**: Initialize .NET 10 solution and projects:
  - `src/DevEngCoach/DevEngCoach.csproj` (Minimal API, C# 13, Native AOT / Trim-ready, File-scoped namespaces)
  - `tests/DevEngCoach.Tests/DevEngCoach.Tests.csproj` (xUnit, FluentAssertions, Microsoft.AspNetCore.Mvc.Testing)
- [x] **Task 1.2**: Implement core domain records in `Common/`:
  - `Lesson.cs`: `DayNumber`, `SprintId`, `Title`, `FocusArea`, `PhoneticsGuide`, `ITVocabulary`, `SentenceFrames`, `PracticeTask`.
  - `PhoneticsGuide.cs`: `TargetSound`, `ActiveArticulator`, `PassiveArticulator`, `Manner`, `Voicing`, `MechanicalInstructions`, `CommonVietnameseMistake`.
  - `ProgressLog.cs`: `DayNumber`, `ScheduledDate`, `CompletedAt`, `PlannedMinutes` (30), `ActualMinutes`, `SelfRating`, `LearnerNotes`.
  - `ProgressSummary.cs`: `CurrentStreak`, `LongestStreak`, `TotalCompletedDays`, `PlanVsActualVarianceMinutes`.

---

## Phase 2: Complete 90-Day Pre-compiled Curriculum

- [x] **Task 2.1**: Author `Data/curriculum.json` containing all 90 days of lessons across 3 Sprints:
  - Sprint 1 (Days 1–30): Kinesthetic Phonetics (Final codas, dental fricatives `/θ/ /ð/`, affricates `/tʃ/ /dʒ/`, consonant clusters, schwa) + Daily Standup Mastery.
  - Sprint 2 (Days 31–60): Connected Speech (Linking, Flap T, Elision, Weak forms) + Sprint Demo Mastery.
  - Sprint 3 (Days 61–90): Professional Workplace Conversations (Ping-Pong Small Talk, Architecture Trade-offs, 1-on-1s).
- [x] **Task 2.2**: Implement `CurriculumService` with high-speed indexed lookup and filtering by Sprint / Day.

---

## Phase 3: Telemetry & Habit Tracker
*(Note: 22:00 Reminder Task removed from backlog per user request)*

- [x] **Task 3.1**: Implement `ProgressService`:
  - Persistent JSON storage in `Data/progress.json`.
  - Streak calculation (consecutive days completed).
  - Plan vs. Actual variance analytics (30 planned mins vs. actual minutes logged).
- [-] **Task 3.2**: `ReminderService` [REMOVED from backlog per user directive].

---

## Phase 4: Embedded AGY CLI AI Assistant Integration

- [x] **Task 4.1**: Implement `AiCoachService`:
  - Subprocess runner executing `agy` CLI (or local Gemini CLI prompt runner) with structured input.
  - Prompt engineered specifically for Vietnamese IT developers: evaluating phonetic precision on ending sounds, syntax correction, and natural tech re-phrasing.
  - Mock/fallback evaluation for offline resiliency.

---

## Phase 5: Single-Page Web Dashboard & Workspace UI

- [x] **Task 5.1**: Develop `wwwroot/index.html` and modern developer UI:
  - Header: 22:00 countdown badge, Streak counter, Plan vs. Actual completion summary.
  - View 1: 90-Day Calendar Matrix (Sprint 1, Sprint 2, Sprint 3 with status badges).
  - View 2: Daily Workspace:
    - 30-minute Pomodoro Timer (Stage 1: 10m Articulation, Stage 2: 10m Frames, Stage 3: 10m AI Output).
    - Mechanical Articulatory Box with visual placement guidance and common Vietnamese mistake alerts.
    - Pluggable Sentence Frames with copyable templates.
    - AI Coach submission console with 1-click evaluation.
- [x] **Task 5.2**: Client-side logic in `wwwroot/app.js`:
  - Local storage caching, speech synthesis (Web Speech API) for native reference audio, speech recognition or text input, and seamless API calls.

---

## Phase 6: Automated Testing & Verification

- [x] **Task 6.1**: Curriculum integrity unit test (ensuring all 90 days have valid phonetics, frames, and tasks).
- [x] **Task 6.2**: ProgressService unit tests (testing streak calculation, plan vs actual duration, edge cases).
- [x] **Task 6.3**: Integration tests for API endpoints (`/api/curriculum`, `/api/progress`, `/api/ai/evaluate`).
- [x] **Task 6.4**: Build, run, and verify the local server at `http://localhost:5000`.

---

## Phase 7: Omnipresent Audio, Contrastive Phonetics & Global AI Assistant Widget

- [x] **Task 7.1**: Implement self-contained CSS layout system in `styles.css` (Fix broken UI, full offline resilience for `.hidden`, grid, flex, cards, buttons without depending on external CDN).
- [x] **Task 7.2**: Implement resilient client initialization & fallback in `app.js` (Prevent stuck `Loading lesson...` state, handle network dropouts gracefully).
- [x] **Task 7.3**: Implement Contrastive Minimal Pairs Module in Workspace (Side-by-side comparison of `/t/` vs `/d/`, `/s/` vs `/z/`, `/θ/` vs `/ð/` with visual articulatory contrast).
- [x] **Task 7.4**: Implement Instant Sound-level Practice & AI Grading Modal across Homepage and Fundamentals (Mic capture, scoring, articulatory correction feedback).
- [x] **Task 7.5**: Add omnipresent 1-click audio playback (`🔊`) to every single IPA symbol, example word, and phrase.
- [x] **Task 7.6**: Add persistent Global Floating AGY AI Assistant widget (FAB) across all pages.
- [x] **Task 7.7**: End-to-End browser verification and automated test suite execution.

---

## Phase 8: Resource Library UI & Learner Self-Rating Telemetry

- [x] **Task 8.1**: Implement interactive 50 YouTube Videos + 50 Articles Resource Library on `fundamentals.html` with real-time search, category filters, and direct links.
- [x] **Task 8.2**: Implement 1-5 Star Self-Rating & Personal Notes inputs on `index.html` and wire up persistence to `/api/progress/complete` in `app.js`.
- [x] **Task 8.3**: Verification and full test pass.
