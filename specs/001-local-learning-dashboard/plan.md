# Implementation Plan: Local Learning Dashboard & Pre-compiled Curriculum Manager

**Branch**: `001-local-learning-dashboard` | **Date**: 2026-11-04 | **Spec**: [spec.md](file:///E:/english/specs/001-local-learning-dashboard/spec.md)

## Summary
Deliver a high-performance local web application built on **C# 12+ / .NET 10 Minimal APIs** with an embedded, zero-build single-page application (SPA). The app pre-packages the complete 90-day Kinesthetic English Curriculum (Standup, Demo, Architecture Review, 1-on-1s), enforces the 30-minute daily habit at 22:00, compares actual study time against planned duration, and integrates directly with the **Antigravity CLI (AGY CLI)** for instant AI feedback.

---

## Technical Context

- **Framework**: .NET 10 Minimal API (C# 13, Primary Constructors, File-Scoped Namespaces)
- **Frontend**: Zero-build embedded SPA (HTML5, Tailwind CSS via local CDN/embedded, Vanilla Modern JS, Web Audio API)
- **Storage**: Local JSON database (`data/progress.json`) + Pre-compiled Curriculum Store (`data/curriculum.json`)
- **Testing**: xUnit + FluentAssertions + Microsoft.AspNetCore.Mvc.Testing
- **Target Platform**: Windows 11 (localhost)
- **AI Integration**: Subprocess invocation of Antigravity CLI (`agy`) or local AI runner with structured prompt templates.
- **Performance Goals**: Server startup < 1.0 second, memory footprint < 50MB, lesson retrieval < 10ms.
- **Constraints**: 100% offline-capable for lessons; zero external API keys required to view curriculum; zero research needed by the learner at 22:00.

---

## Constitution Check

- [x] **Principle I: Product Purpose Inviolability**: Every endpoint and UI element serves the 90-day technical speaking goal. Zero generic/distracting content.
- [x] **Principle II: Zero-Friction & Zero-Research**: All 90 lessons are bundled locally with full articulatory guides and sentence frames.
- [x] **Principle III: Kinesthetic Articulatory Primacy**: UI presents explicit tongue/lip/vocal-cord mechanics instead of acoustic mimicry.
- [x] **Principle IV: Chunk-Based Functional Synthesis**: Lesson templates provide fixed sentence frames with pluggable software variables.
- [x] **Principle V: Clean .NET Architecture**: Strict Senior .NET standards, file-scoped namespaces, primary constructors, lightweight Minimal APIs.

---

## Architecture & Project Structure

```text
E:\english\
├── .specify\                                 # Spec Kit metadata & constitution
├── specs\001-local-learning-dashboard\       # Feature spec, plan, tasks
├── src\
│   └── DevEngCoach\
│       ├── DevEngCoach.csproj                # .NET 10 Minimal API project
│       ├── Program.cs                        # Minimal API route configuration
│       ├── Common\                           # Domain models & records
│       │   ├── Lesson.cs                     # Day 1-90 curriculum model
│       │   ├── ProgressLog.cs                # Actual vs. Plan tracking
│       │   └── AiEvaluation.cs               # AI request/response records
│       ├── Services\
│       │   ├── ICurriculumService.cs         # Curriculum access & search
│       │   ├── CurriculumService.cs
│       │   ├── IProgressService.cs           # Progress, streak, plan vs actual
│       │   ├── ProgressService.cs
│       │   ├── IAiCoachService.cs            # AGY CLI process runner & parser
│       │   ├── AiCoachService.cs
│       │   ├── IReminderService.cs           # 22:00 scheduler & notifier
│       │   └── ReminderService.cs
│       ├── Data\
│       │   ├── curriculum.json               # 90-day pre-compiled curriculum
│       │   └── progress.json                 # Learner telemetry & streak
│       └── wwwroot\                          # Embedded modern UI
│           ├── index.html                    # Single-Page Dashboard & Workspace
│           ├── app.js                        # Client state, audio recorder, timer
│           ├── styles.css                    # Developer dark-mode styling
│           └── assets\                       # Mechanical SVG diagrams (tongue/palate)
└── tests\
    └── DevEngCoach.Tests\
        ├── DevEngCoach.Tests.csproj          # xUnit + FluentAssertions
        ├── CurriculumTests.cs                # Validates all 90 days structure
        ├── ProgressServiceTests.cs           # Streak & plan vs actual variance tests
        └── ApiIntegrationTests.cs            # WebApplicationFactory API tests
```

---

## API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/curriculum` | Returns 90-day sprint index & overview |
| `GET` | `/api/curriculum/{day}` | Returns day's articulatory drill, frames, and task |
| `GET` | `/api/progress` | Returns overall streak, completed count, plan vs actual stats |
| `POST` | `/api/progress/complete` | Saves session completion (actual minutes, rating, notes) |
| `POST` | `/api/ai/evaluate` | Invokes AGY CLI to critique learner's spoken/written output |
| `GET` | `/api/reminder/status` | Returns 22:00 notification status & schedule |
| `POST` | `/api/reminder/test` | Triggers a test desktop toast notification |

---

## Implementation Steps

1. **Scaffold .NET 10 Solution**: Create `src/DevEngCoach` and `tests/DevEngCoach.Tests`.
2. **Build Pre-compiled Curriculum Data (`data/curriculum.json`)**:
   - Sprint 1 (Days 1–30): Kinesthetic Phonetics (Final codas `/t/`, `/d/`, `/s/`, `/z/`, dental `/θ/`, `/ð/`, affricates `/tʃ/`, `/dʒ/`, consonant clusters, schwa `/ə/`) + Daily Standup Mastery.
   - Sprint 2 (Days 31–60): Connected Speech (Linking, Flap T, Elision, Weak Forms) + Sprint Demo Mastery.
   - Sprint 3 (Days 61–90): Professional Workplace Conversations (Ping-Pong Small Talk, Architecture Trade-offs, 1-on-1s).
3. **Implement Services & Domain Logic**:
   - `CurriculumService`: Fast indexed lookup.
   - `ProgressService`: Streak calculation, plan-vs-actual variance, JSON file persistence.
   - `AiCoachService`: Subprocess runner for AGY CLI / Gemini fallback with prompt engineering tailored to Vietnamese developers.
   - `ReminderService`: Background service checking 22:00 schedule and issuing desktop notifications.
4. **Develop Single-Page UI (`wwwroot`)**:
   - Calendar / Timeline view (color-coded by Sprint).
   - 30-minute Pomodoro timer (10m Articulation -> 10m Frames -> 10m AI Output).
   - Interactive mouth/tongue cross-section guidance.
   - Embedded AI practice console with 1-click evaluation.
5. **Verify with Automated Tests**:
   - Curriculum completeness (all 90 days validated).
   - Progress and streak logic tests with xUnit & FluentAssertions.
   - End-to-end endpoint verification with `WebApplicationFactory`.
