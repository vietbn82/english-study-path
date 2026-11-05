# Feature Specification: Local Learning Dashboard & Pre-compiled Material Manager with AGY AI Assistant

**Feature Branch**: `001-local-learning-dashboard`  
**Created**: 2026-11-04  
**Status**: Ready for Planning  
**Input**: User description: "Local learning dashboard to track 90-day progress, 22:00 reminder, plan vs actual comparison, pre-compiled daily materials (zero research), and embedded AGY CLI AI Assistant."

---

## User Scenarios & Testing

### User Story 1 - Zero-Friction Daily Study Routine at 22:00 (Priority: P1)
As a 33-year-old Vietnamese software developer with poor sound perception, I want to open my local dashboard at 22:00 and immediately see 100% of my lesson for the day (exact tongue/lip placement diagrams, IT-specific phoneme drills, 2 fixed sentence frames, and my practice prompt) so that I do not spend a single second searching Google or YouTube and can start practicing within 5 seconds.

**Why this priority**: Core value of the product. Eliminating friction and cognitive fatigue is the only way a busy developer maintains a 90-day daily habit.

**Independent Test**: Load the dashboard, select Day 1 (or today's scheduled day). Verify all 3 stages (Kinesthetic Phonetics, Sentence Frames, Practice Task) are visible and actionable with zero external network queries required.

**Acceptance Scenarios**:
1. **Given** the user visits `http://localhost:5000` (or configured local port), **When** today is Day 1, **Then** the UI shows Day 1: "Ending Consonants: /t/ vs /d/", complete with physical mouth diagrams, IT vocabulary drills (`test`, `build`, `commit`), 2 Standup sentence frames, and the practice task.
2. **Given** the user starts the 30-minute session, **When** the timer runs, **Then** the 3 sub-blocks (10m Articulatory Drill -> 10m Sentence Frame -> 10m AI Output) guide the time allocation.

---

### User Story 2 - Plan vs. Actual Progress Tracking & 22:00 Notifications (Priority: P2)
As a learner, I want the dashboard to track my completion status, log actual study duration against the 30-minute plan, calculate my streak, and notify me at 22:00 so that I stay accountable throughout the 90 days.

**Why this priority**: Feedback loop and habit reinforcement prevent abandonment.

**Independent Test**: Complete a day's session, mark it complete with actual time spent, and verify the summary dashboard updates the completion rate, burn-down metric, and streak.

**Acceptance Scenarios**:
1. **Given** a day's session is marked complete, **When** the user saves, **Then** the local database/JSON stores `DayNumber`, `CompletedAt`, `ActualMinutes`, and `SelfRating`, and updates the streak counter.
2. **Given** the current system time is 22:00 and today's session is incomplete, **When** the reminder service triggers, **Then** a desktop notification or prominent dashboard alert alerts the user to start their 30-minute session.

---

### User Story 3 - Embedded AI Assistant via AGY CLI (Priority: P3)
As a developer, I want to submit my daily speech transcript or practice sentence directly to an embedded AGY CLI AI Assistant inside the dashboard, so that I receive immediate, actionable corrections on technical pronunciation cues, syntax errors, and sentence naturalness without leaving the app.

**Why this priority**: Replaces expensive private tutors with an on-demand, high-signal AI evaluator tailored to Vietnamese developers.

**Independent Test**: Submit a practice sentence (e.g., *"Yesterday I fix bug in auth controller"*), verify the embedded AGY CLI integration returns: (1) Grammar correction, (2) Kinesthetic pronunciation reminder for `-ed` and `/θ/` in `auth`, and (3) a natural senior dev refactoring of the sentence.

**Acceptance Scenarios**:
1. **Given** the user enters their draft sentence or speech transcript in the AI Coach tab, **When** they click "Evaluate with AGY AI", **Then** the backend executes the AGY CLI prompt runner and displays structured feedback within 5 seconds.

---

## Requirements

### Functional Requirements

- **FR-001 (Curriculum Pre-packaging)**: The system MUST store and render 90 pre-compiled daily lessons divided into 3 distinct Sprints:
  - Sprint 1 (Days 1–30): Kinesthetic Articulatory Mechanics & Daily Standup Mastery.
  - Sprint 2 (Days 31–60): Connected Speech, Linking & Sprint Demo Walkthrough.
  - Sprint 3 (Days 61–90): Professional Workplace Conversations, Architecture Trade-offs & 1-on-1s.
- **FR-002 (Kinesthetic Visuals & Data)**: Each daily lesson MUST include explicit physical articulatory specifications: Active articulators (tongue position, lip shape), Passive articulators (teeth, palate), Manner (plosive, fricative), and Voicing status.
- **FR-003 (Plan vs Actual Telemetry)**: The system MUST record:
  - Planned: 30 minutes at 22:00.
  - Actual: Start time, finish time, duration (minutes), completion status (`Pending`, `Completed`, `Skipped`).
  - Progress metrics: Current Streak, Total Completed Days, Overall Completion Percentage.
- **FR-004 (22:00 Reminder Hook - DROPPED FROM SCOPE)**: [Removed from backlog per user request]. Daily habit tracking relies on the in-dashboard Pomodoro timer and plan vs. actual telemetry.
- **FR-005 (AGY CLI Integration)**: The backend MUST expose an API endpoint (`/api/ai/evaluate`) that invokes the local Antigravity CLI / Gemini AI to evaluate learner input against the day's phonetic targets and sentence frames.
- **FR-006 (Zero External Dependency for Core Curriculum)**: The entire 90-day curriculum and dashboard MUST function completely offline on `localhost`.
- **FR-007 (Omnipresent Audio Playback)**: Every IPA symbol, vocabulary word, example sentence, and minimal pair comparison across all pages (Dashboard & Fundamentals) MUST provide a 1-click audio playback button (`🔊`).
- **FR-008 (Global Floating AGY AI Assistant)**: A persistent Floating Action Button (FAB) and slide-out chat modal MUST be present on all pages (`index.html`, `fundamentals.html`) to invoke AGY CLI assistance at any point.
- **FR-009 (Interactive Sound-Level Speech Grading)**: Every phonetic unit and minimal pair entry MUST include a direct "Nói & Chấm Điểm" (Practice & Grade with AI) action with mic recording and immediate 1-100 fluency/accuracy scoring.
- **FR-010 (Contrastive Minimal Pairs Matrix)**: Each lesson and the Fundamentals reference MUST explicitly feature side-by-side contrastive sound pairs (e.g., `/t/` vs `/d/`, `/s/` vs `/z/`, `/θ/` vs `/ð/`, `/iː/` vs `/ɪ/`) highlighting articulatory differences (voicing, aspiration, duration).

### Key Entities

- **Lesson**: `DayNumber` (1-90), `Sprint` (1-3), `Title`, `TargetPhonemes`, `ArticulatoryMechanics` (text/diagram instructions), `ITVocabulary` (list of words + phonetic notes), `SentenceFrames` (list of templates), `PracticeScenario`.
- **SessionLog**: `DayNumber`, `ScheduledDate`, `CompletedAt`, `PlannedMinutes` (30), `ActualMinutes`, `Status` (Completed/Skipped/Pending), `LearnerNotes`, `AIEvaluationSummary`.
- **ProgressSummary**: `CurrentStreak`, `LongestStreak`, `TotalDaysCompleted`, `PlanVsActualVarianceMinutes`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Time-to-Practice)**: From launching the app to viewing the day's exact phonetics and sentence frames takes `< 2 seconds`.
- **SC-002 (Zero Research Guarantee)**: 100% of the lessons contain all necessary articulatory instructions and templates; user never needs to leave the dashboard to search for study materials.
- **SC-003 (Reliable Habit Tracking)**: Real-time calculation of streak and plan vs. actual variance accurately reflects local session submissions.
- **SC-004 (High-Signal AI Feedback)**: AI evaluation responses return within 5 seconds with specific kinesthetic tips and natural sentence refactoring.

---

## Assumptions & Boundaries

- Target user runs the dashboard locally on Windows 11 with .NET 10 installed.
- AGY CLI / Gemini environment is configured on the host machine.
- Audio recording in browser uses the Web Audio API / MediaRecorder, with fallback to text input.
