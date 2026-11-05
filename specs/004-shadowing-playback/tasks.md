# Task Breakdown: Shadowing Mode with Playback Comparison

**Feature**: `004-shadowing-playback` | **Spec**: [spec.md](file:///E:/english/specs/004-shadowing-playback/spec.md) | **Plan**: [plan.md](file:///E:/english/specs/004-shadowing-playback/plan.md)

---

## Phase 1: Domain Models & Timing Engine

- [ ] **Task 1.1**: Create `Common/ShadowingModels.cs`:
  - `ShadowingEvaluateRequest`: `DayNumber`, `TargetSentence`, `ReferenceDurationMs`, `UserDurationMs`, `UserTranscript`, `DetectedPausesCount`.
  - `ShadowingFeedbackResponse`: `PacingScore` (0-100), `PacingDiagnosis` (e.g., "Rushed", "Lagging", "Natural"), `SpeedRatio`, `StressTimingTips`, `DroppedCodaAlerts` (List of strings), `ActionableRecommendation`.
  - `ReferenceAudioInfo`: `DayNumber`, `FrameIndex`, `SentenceText`, `AudioUrl`, `ExpectedDurationMs`.

---

## Phase 2: Shadowing Service Implementation

- [ ] **Task 2.1**: Implement `IShadowingService` and `ShadowingService`:
  - Algorithmic timing comparison: calculates duration variance ratio between reference audio and learner recording.
  - Stress-timing vs Syllable-timing analyzer: flags Vietnamese tendency to give every word equal duration instead of elongating content words and reducing function words.
  - Integration with `IAiCoachService`: formats prompt for deep sentence-level intonation coaching.
  - Robust heuristic fallback engine for 100% offline usage.

---

## Phase 3: Minimal API Endpoints

- [ ] **Task 3.1**: Register `IShadowingService` in `Program.cs`.
- [ ] **Task 3.2**: Expose endpoints:
  - `POST /api/shadowing/evaluate`
  - `GET /api/shadowing/reference/{day}`

---

## Phase 4: Dual Audio Player & Stacked Waveform Visualizer

- [ ] **Task 4.1**: Build Shadowing Studio UI in `wwwroot/index.html`:
  - Reference audio player with speed controller (1.0x, 0.85x, 0.7x).
  - Recording trigger with elapsed time gauge and audio level meter.
  - Dual Playback Controller:
    - `▶️ Compare (Back-to-Back)` button (plays Reference -> 500ms pause -> User audio).
    - `🔀 Toggle A/B` button with active track indicator.
  - Stacked Canvas Container: Top canvas for Reference Waveform (Cyan/Blue), Bottom canvas for User Waveform (Orange) with synchronized playback playhead.
  - AI Shadowing Feedback card showing pacing diagnosis and stress-timing tips.
- [ ] **Task 4.2**: Client-side Web Audio engine in `wwwroot/app.js`:
  - `AudioContext.decodeAudioData` buffer parser extracting peak amplitudes into canvas waveform lines.
  - Synced scrubbing logic: clicking either waveform seeks both tracks to the corresponding timestamp.
  - Sequential playback orchestrator for back-to-back listening.

---

## Phase 5: Automated Testing & Verification

- [ ] **Task 5.1**: Author unit tests in `tests/DevEngCoach.Tests/ShadowingServiceTests.cs`:
  - Test speed ratio computation (rushed vs slow vs optimal).
  - Test stress-timing recommendations generation.
  - Test dropped coda warning extraction.
- [ ] **Task 5.2**: Integration tests for shadowing endpoints in `tests/DevEngCoach.Tests/ApiIntegrationTests.cs`.
- [ ] **Task 5.3**: Full build, execution, and verification with `dotnet test`.
