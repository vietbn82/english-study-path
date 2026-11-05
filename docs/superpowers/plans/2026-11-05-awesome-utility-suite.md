# Awesome Utility Suite: Sparring Partner, Workflow Companion & SRS Speech Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or parallel dispatch to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three transformative, high-utility developer English features: (1) Senior Lead AI Sparring Partner (live tech debate & incident bridge simulation), (2) Dev-Workflow Native Companion (`deveng` CLI + PR Review & Tech Spec Polisher), and (3) SRS Leitner Weak-Spot Lab with Real-Time Audio Canvas Spectrogram.

**Architecture:** 
- Modular .NET 10 Minimal API architecture with clean service boundaries: `ISparringService`, `IPrPolisherService`, `ISrsService`.
- A standalone fast .NET 10 CLI console app (`src/DevEngCli`) providing terminal commands (`deveng standup`, `deveng pr`, `deveng warmup`, `deveng review`).
- Front-end extension: Interactive Web Audio API waveform visualizer, Sparring voice dialogue arena, PR Polisher Studio, and SRS Review Vault in `index.html` and `app.js`.

**Tech Stack:** C# 13, .NET 10, Minimal APIs, xUnit, FluentAssertions, HTML5 Web Audio API & Canvas, Tailwind CSS.

**Spec:** High-utility developer English suite expanding on `specs/001-local-learning-dashboard/spec.md`.

## Global Constraints
- Modern C# idioms: file-scoped namespaces, primary constructors, strongly-typed records.
- Zero breaking changes to existing 90-day curriculum and progress endpoints.
- 100% offline resilience: fallback heuristic engines when AGY CLI / Gemini is not available.
- All unit and integration tests must pass cleanly.

---

### Task 1: Domain Models & Service for Feature 1 (AI Sparring Partner)
**Files:**
- Create: `src/DevEngCoach/Common/SparringModels.cs`
- Create: `src/DevEngCoach/Services/SparringService.cs`
- Test: `tests/DevEngCoach.Tests/SparringServiceTests.cs`

**Interfaces:**
- `ISparringService`:
  - `Task<SparringResponse> ProcessTurnAsync(SparringTurnRequest request, CancellationToken ct = default);`
  - `IReadOnlyList<SparringScenario> GetScenarios();`

---

### Task 2: Domain Models & Service for Feature 2 (PR & Tech Spec Polisher + Terminal CLI)
**Files:**
- Create: `src/DevEngCoach/Common/PrPolisherModels.cs`
- Create: `src/DevEngCoach/Services/PrPolisherService.cs`
- Create: `src/DevEngCli/Program.cs`
- Create: `src/DevEngCli/DevEngCli.csproj`
- Test: `tests/DevEngCoach.Tests/PrPolisherServiceTests.cs`

**Interfaces:**
- `IPrPolisherService`:
  - `Task<PrPolishResponse> PolishAsync(PrPolishRequest request, CancellationToken ct = default);`
- `deveng` CLI arguments: `standup`, `pr <text>`, `commit <text>`, `warmup`.

---

### Task 3: Domain Models & Service for Feature 3 (SRS Leitner Weak-Spot Engine)
**Files:**
- Create: `src/DevEngCoach/Common/SrsModels.cs`
- Create: `src/DevEngCoach/Services/SrsService.cs`
- Test: `tests/DevEngCoach.Tests/SrsServiceTests.cs`

**Interfaces:**
- `ISrsService`:
  - `IReadOnlyList<SrsItem> GetDueItems();`
  - `SrsItem RecordReview(SrsReviewRequest request);`
  - `SrsItem AutoEnrollWeakSpot(string wordOrPhrase, string targetPhoneme, int score);`
  - `SrsStats GetStats();`

---

### Task 4: API Gateway Integration in Minimal APIs
**Files:**
- Modify: `src/DevEngCoach/Program.cs`
- Test: `tests/DevEngCoach.Tests/ApiIntegrationTests.cs`

**Endpoints:**
- `GET /api/sparring/scenarios`
- `POST /api/sparring/turn`
- `POST /api/pr/polish`
- `GET /api/srs/queue`
- `POST /api/srs/review`
- `GET /api/srs/stats`

---

### Task 5: Frontend UI & Interactive Studio
**Files:**
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Modify: `src/DevEngCoach/wwwroot/styles.css`

**Features:**
- Sparring Arena (Interactive roleplay with audio playback & real-time metric gauges).
- PR Review & Code Comment Polisher Studio (Tone selector: Constructive, Diplomatic Pushback, Inquiry).
- SRS Leitner Flashcard Vault widget.
- Web Audio API Canvas Real-Time Waveform / Spectrogram visualizer for phonetic recording.

---

### Task 6: Full Verification & Test Pass
- Run `dotnet test` ensuring 100% pass across all existing and new unit/integration tests.
- Verify CLI execution and browser interface responsiveness.
