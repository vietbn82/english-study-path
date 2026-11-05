# Implementation Plan: Speech-to-Text Pronunciation Scorer

**Branch**: `002-pronunciation-scorer` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/002-pronunciation-scorer/spec.md)

---

## 1. Summary

Implement a specialized **Speech-to-Text Pronunciation Scorer** tailored specifically for Vietnamese software engineers. The system captures developer speech in real-time, transcribes it via browser SpeechRecognition API (with offline server-side heuristic fallback at `/api/speech/transcribe`), analyzes phoneme-level accuracy against target curriculum phonemes, detects Vietnamese phonological interference (dropped codas, `/θ/` substitutions, cluster omissions), renders color-coded articulatory feedback, and auto-enrolls low-scoring words (<60%) directly into the existing SRS Leitner engine (`ISrsService.AutoEnrollWeakSpot`).

---

## 2. Technical Context

- **Framework**: .NET 10 Minimal API (C# 13, Primary Constructors, File-Scoped Namespaces)
- **Frontend**: Zero-build vanilla JS + Web Speech API + MediaRecorder + HTML5 Canvas
- **Storage**: JSON storage (`Data/speech_scores.json` and auto-enrollment into `Data/srs.json`)
- **Testing**: xUnit + FluentAssertions + Microsoft.AspNetCore.Mvc.Testing
- **Integration Points**: 
  - `ISrsService`: auto-enroll weak spots when accuracy < 60%
  - `ICurriculumService`: source of target phonemes and kinesthetic tips per day
- **Performance Goals**: Phoneme analysis < 50ms, end-to-end scoring response < 500ms
- **Constraints**: 100% offline-first fallback when external AI or SpeechRecognition API is unavailable; zero external API keys required.

---

## 3. Constitution Check

- [x] **Principle I: Product Purpose Inviolability**: Focuses strictly on technical pronunciation drills (`commit`, `deploy`, `concurrency`, `auth`) and Vietnamese developer sound errors.
- [x] **Principle II: Zero-Friction & Zero-Research**: Phoneme targets and articulatory corrections are pre-loaded from `curriculum.json`.
- [x] **Principle III: Kinesthetic Articulatory Primacy**: Errors provide concrete physical tongue/teeth/palate placement instructions, not abstract auditory grading.
- [x] **Principle IV: Chunk-Based Functional Synthesis**: Integrates directly with daily sentence frames and vocabulary.
- [x] **Principle V: Clean .NET Architecture**: Strict domain boundaries, dependency injection, primary constructors, immutable records.

---

## 4. Architecture & Component Design

```text
E:\english\
├── specs\002-pronunciation-scorer\
│   ├── spec.md                       # Feature requirements
│   ├── plan.md                       # This plan
│   └── tasks.md                      # Actionable work breakdown
├── src\DevEngCoach\
│   ├── Common\
│   │   └── SpeechScoringModels.cs    # SpeechAttempt, PhonemeResult, DrillScore records
│   ├── Services\
│   │   ├── ISpeechScoringService.cs  # Phoneme alignment & scoring contract
│   │   └── SpeechScoringService.cs   # Vietnamese interference analyzer & scorer
│   ├── Program.cs                    # Minimal API endpoints (/api/speech/*)
│   └── wwwroot\
│       ├── index.html                # Pronunciation Scorer UI & phoneme color-coder
│       ├── app.js                    # Audio capture & real-time phoneme rendering
│       └── styles.css                # Color-coding (green/orange/red) & badge styles
└── tests\DevEngCoach.Tests\
    └── SpeechScoringServiceTests.cs  # xUnit + FluentAssertions unit tests
```

---

## 5. API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/speech/score` | Evaluates transcribed text against target word/sentence and returns phoneme-level breakdown |
| `POST` | `/api/speech/transcribe` | Fallback audio transcription endpoint accepting audio/webm or audio/wav |
| `GET` | `/api/speech/scores/summary` | Retrieves aggregate accuracy by phoneme category (codas, fricatives, clusters) |
| `GET` | `/api/speech/scores/history` | Retrieves recent drill score history |

---

## 6. Verification Plan

1. **Unit Tests (`SpeechScoringServiceTests.cs`)**:
   - Detect dropped ending `/t/` in "commit" and "test" -> accuracy score < 70%, category `EndingConsonant`.
   - Detect `/θ/` -> `/t/` substitution in "method" and "auth" -> flags dental fricative error with kinesthetic tip.
   - Detect consonant cluster simplification in "scripts" and "fixed".
   - Verify auto-enrollment into `ISrsService` when overall score < 60%.
2. **API Integration Tests**:
   - Verify `/api/speech/score` returns 200 OK with structured `PhonemeResult` items.
3. **End-to-End Browser Check**:
   - Record via mic on Day 1 lesson, verify recognized text, color-coded badges, and score display.
