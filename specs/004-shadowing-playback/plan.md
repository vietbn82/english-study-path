# Implementation Plan: Shadowing Mode with Playback Comparison

**Branch**: `004-shadowing-playback` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/004-shadowing-playback/spec.md)

---

## 1. Summary

Implement an advanced **Shadowing Mode with Playback Comparison** for kinesthetic learners. The feature enables Vietnamese developers to:
1. Listen to a natural technical reference audio clip for any curriculum sentence frame or drill.
2. Record their own spoken repetition via browser `MediaRecorder` API.
3. Compare audio back-to-back (Reference → 500ms pause → User) or toggle with 1-click A/B switching.
4. Visually inspect differences using **vertically stacked dual audio waveforms** on HTML5 Canvas to spot rushed syllables, swallowed codas, and cadence deviations.
5. Receive **AI Shadowing Feedback** analyzing timing ratios, stress-timing vs syllable-timing, and consonant burst clarity.

---

## 2. Technical Context

- **Framework**: .NET 10 Minimal API (C# 13, Primary Constructors, File-Scoped Namespaces)
- **Frontend**: Web Audio API (`AudioContext`, `AnalyserNode`, `AudioBuffer`) + HTML5 Canvas + MediaRecorder
- **Storage**: Client-side audio blobs (memory/indexedDB for "Save Best") + server-side prompt evaluation
- **Testing**: xUnit + FluentAssertions + Microsoft.AspNetCore.Mvc.Testing
- **Integration Points**: `IAiCoachService`, `ICurriculumService`
- **Performance Goals**: Waveform render < 16ms (60 fps), playback switch latency < 50ms, AI feedback < 5s
- **Constraints**: 100% offline audio comparison; fallback to Web Speech Synthesis API (TTS) when pre-recorded clips are unavailable.

---

## 3. Constitution Check

- [x] **Principle I: Product Purpose Inviolability**: Every audio sentence targets technical scenarios (Standup, Demo, Architecture trade-offs).
- [x] **Principle II: Zero-Friction & Zero-Research**: Sentence models are linked directly to daily curriculum frames.
- [x] **Principle III: Kinesthetic Articulatory Primacy**: Waveforms convert acoustic differences into visible spatial cues for learners with low auditory perception.
- [x] **Principle IV: Chunk-Based Functional Synthesis**: Exercises drill fixed sentence frames with pluggable IT terms.
- [x] **Principle V: Clean .NET Architecture**: Decoupled service layer (`IShadowingService`), typed DTOs, full unit test coverage.

---

## 4. Architecture & Component Design

```text
E:\english\
├── specs\004-shadowing-playback\
│   ├── spec.md                     # Feature requirements
│   ├── plan.md                     # This plan
│   └── tasks.md                    # Actionable work breakdown
├── src\DevEngCoach\
│   ├── Common\
│   │   └── ShadowingModels.cs      # ShadowingRequest, ShadowingFeedback, WaveformMetrics
│   ├── Services\
│   │   ├── IShadowingService.cs    # Pacing analysis & AI comparison contract
│   │   └── ShadowingService.cs     # Timing comparator & articulatory coach
│   ├── Program.cs                  # Endpoints (/api/shadowing/*)
│   └── wwwroot\
│       ├── index.html              # Shadowing Studio modal / workspace tab
│       ├── app.js                  # Web Audio AnalyserNode waveform engine & dual player
│       └── styles.css              # Dual player controls, A/B toggle badge & canvas styling
└── tests\DevEngCoach.Tests\
    └── ShadowingServiceTests.cs    # xUnit + FluentAssertions unit tests
```

---

## 5. API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/shadowing/evaluate` | Evaluates user audio metrics (duration, pauses, transcript) against reference model |
| `GET` | `/api/shadowing/reference/{day}` | Returns reference audio metadata, duration benchmarks, and sentence frames |

---

## 6. Verification Plan

1. **Unit Tests (`ShadowingServiceTests.cs`)**:
   - Pacing evaluation: detect rushed speech (user 2.0s vs reference 3.5s) -> flags syllable-timing error with corrective recommendation.
   - Pacing evaluation: detect excessive pauses (> 1.5s silence gap) -> flags hesitation.
   - Articulatory burst comparison: detects missing ending bursts in target words.
2. **API Integration Tests**:
   - Verify `/api/shadowing/evaluate` returns 200 OK with actionable feedback.
3. **Frontend Visual Verification**:
   - Record user audio, verify stacked canvas waveforms render with synchronized playback cursor, back-to-back playback triggers seamlessly with 500ms gap, and A/B toggle works instantaneously.
