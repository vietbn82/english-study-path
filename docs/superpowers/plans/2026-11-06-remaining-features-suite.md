# Remaining Features & Production Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining functional capabilities of the DevEng Coach ecosystem: Data Backup & Portability Manager, Developer Ergonomics & Global Command Palette (`Ctrl+K`), Milestone Capstone Assessments (Days 30, 60, 90), Kinematic Vocal Tract Motion Simulator, and PWA Offline Readiness.

**Architecture:** Extend the existing ASP.NET Core 10 Minimal API backend with clean domain service interfaces (`IBackupService`, `ICapstoneService`), record-based DTOs, and comprehensive xUnit tests with FluentAssertions. Front-end capabilities will be modularly added to `src/DevEngCoach/wwwroot/` following the existing Web Component and vanillajs patterns.

**Tech Stack:** .NET 10 (C# 13, file-scoped namespaces, primary constructors), ASP.NET Core Minimal APIs, xUnit, FluentAssertions, Vanilla JS (ES6+ Web Components), Tailwind CSS utility classes, HTML5 Canvas/SVG, Web Storage/Service Worker.

**Spec:** `plan/roadmap_deep_90days.md` (Milestones 1-3, Capstone simulations, zero-friction daily routine).

## Global Constraints

- Modern C# 13 with file-scoped namespaces and primary constructors.
- Target framework: `net10.0`.
- All shared UI modals, drawers, and overlays must be packaged as native Web Components or modular utilities in `src/DevEngCoach/wwwroot/`.
- Zero third-party JavaScript framework dependencies (preserve lightweight vanilla architecture).
- All unit and integration tests must pass cleanly with `dotnet test`.

## Review Focus

1. Corrupted or invalid JSON import payload in Backup Manager: must return HTTP 400 with a descriptive error message without crashing or corrupting existing progress state.
2. Incomplete or empty Capstone submission: validation must ensure all mandatory sections (e.g. Yesterday/Today/Blocker for Standup) are present before grading.
3. Keyboard shortcut collisions with native inputs: shortcut handler must ignore typing inside `<input>`, `<textarea>`, or `contenteditable` elements.
4. Offline cache handling: Service worker must cleanly fallback to cache when disconnected and refresh gracefully when online.
5. Large audio/recording payload: must handle base64 audio and ensure memory efficiency without buffer leaks.

---

### Task 1: Data Backup & Portability Manager (`IBackupService` & Endpoints)

**Files:**
- Create: `src/DevEngCoach/Services/IBackupService.cs`
- Create: `src/DevEngCoach/Services/BackupService.cs`
- Create: `tests/DevEngCoach.Tests/BackupServiceTests.cs`
- Modify: `src/DevEngCoach/Program.cs`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`

**Interfaces:**
- Produces: `BackupPayload GetFullBackup()`, `BackupImportResult ImportBackup(BackupPayload payload)`
- Endpoint: `GET /api/backup/export` (downloads full JSON state)
- Endpoint: `POST /api/backup/import` (restores state safely with schema validation)

- [ ] **Step 1: Write the failing unit tests for `IBackupService`**

```csharp
namespace DevEngCoach.Tests;

public class BackupServiceTests
{
    [Fact]
    public void GetFullBackup_ReturnsAllDatasets()
    {
        // Assert that backup contains progress, srs items, and speech scores
    }

    [Fact]
    public void ImportBackup_ValidData_OverwritesSafely()
    {
        // Assert valid payload updates state and returns success
    }

    [Fact]
    public void ImportBackup_NullOrInvalid_ReturnsFailure()
    {
        // Assert invalid payload fails gracefully
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test --filter FullyQualifiedName~BackupServiceTests`
Expected: FAIL (compilation error, service does not exist yet)

- [ ] **Step 3: Implement `IBackupService` and `BackupService`**

Implement `src/DevEngCoach/Services/IBackupService.cs` and `BackupService.cs` aggregating `IProgressService`, `ISrsService`, and `ISpeechScoringService`. Register in `Program.cs` and map `/api/backup/export` and `/api/backup/import`.

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test --filter FullyQualifiedName~BackupServiceTests`
Expected: PASS

- [ ] **Step 5: Wire up Backup/Export UI in `index.html` and `app.js`**

Add an Export/Import modal or toolbar action in the header bar with one-click Download JSON and File Upload.

- [ ] **Step 6: Commit**

```bash
git add src/DevEngCoach/Services/IBackupService.cs src/DevEngCoach/Services/BackupService.cs tests/DevEngCoach.Tests/BackupServiceTests.cs src/DevEngCoach/Program.cs src/DevEngCoach/wwwroot/
git commit -m "feat(backup): implement full progress data export and import service with UI dialog"
```

---

### Task 2: Developer Ergonomics & Global Command Palette (`Ctrl+K`)

**Files:**
- Create: `src/DevEngCoach/wwwroot/deveng-command-palette.js`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/fundamentals.html`
- Modify: `src/DevEngCoach/wwwroot/styles.css`

**Interfaces:**
- Produces: `<deveng-command-palette>` Web Component
- Consumes: `/api/curriculum`, `/api/ipa/glossary`, `/api/mouthmap/all`
- Shortcuts:
  - `Ctrl + K` or `Cmd + K`: Toggle command palette
  - `Space`: Toggle mic recording (when not typing in an input)
  - `Ctrl + Enter`: Submit current exercise/simulation
  - `1 / 2 / 3`: Quick jump to Stage 1 (Phonetics), Stage 2 (Frames), Stage 3 (AI Output)
  - `Esc`: Close open modal / palette

- [ ] **Step 1: Create Web Component `<deveng-command-palette>`**

Define custom element in `deveng-command-palette.js` rendering a spotlight-style overlay modal with instant fuzzy search for:
- 90 Days Curriculum titles & objectives
- Technical Vocabulary & IPA symbols
- Quick navigation to views: Workspace, Simulators, Sparring, PR Polisher, SRS, Analytics, Handbook.

- [ ] **Step 2: Add Global Keyboard Shortcuts Handler**

Bind `keydown` listener that checks `event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA'` for `Space` (audio toggle), `Ctrl+K` (palette), and `1, 2, 3` (stage switching).

- [ ] **Step 3: Test keyboard shortcuts and navigation in browser**

Verify `Ctrl+K` opens spotlight search, typing filters lessons, and pressing `Enter` navigates to target day/view immediately.

- [ ] **Step 4: Commit**

```bash
git add src/DevEngCoach/wwwroot/deveng-command-palette.js src/DevEngCoach/wwwroot/index.html src/DevEngCoach/wwwroot/fundamentals.html src/DevEngCoach/wwwroot/styles.css
git commit -m "feat(ux): add developer command palette with Ctrl+K and hotkey shortcuts"
```

---

### Task 3: Milestone Capstone Assessment Engine (Days 30, 60, 90)

**Files:**
- Create: `src/DevEngCoach/Services/ICapstoneService.cs`
- Create: `src/DevEngCoach/Services/CapstoneService.cs`
- Create: `tests/DevEngCoach.Tests/CapstoneServiceTests.cs`
- Modify: `src/DevEngCoach/Program.cs`
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Modify: `src/DevEngCoach/wwwroot/index.html`

**Interfaces:**
- Produces: `Task<CapstoneEvaluationResult> EvaluateCapstoneAsync(CapstoneSubmissionRequest request, CancellationToken ct)`
- Endpoints:
  - `GET /api/capstone/{day:int}`: Get capstone guidelines & criteria
  - `POST /api/capstone/evaluate`: Grade submission across 4 criteria (Ending Consonants/Phonetics, Pacing & Fluency, Sentence Structure, Vocabulary Mastery) and generate a graduation certificate summary.

- [ ] **Step 1: Write the failing tests for `ICapstoneService`**

```csharp
namespace DevEngCoach.Tests;

public class CapstoneServiceTests
{
    [Theory]
    [InlineData(30)]
    [InlineData(60)]
    [InlineData(90)]
    public void GetCapstoneRequirements_ReturnsValidSpecification(int day)
    {
        // Assert criteria, time limit, and rubrics exist
    }

    [Fact]
    public async Task EvaluateCapstone_Day30_ValidInput_ScoresAccurately()
    {
        // Assert rubrics score calculation, feedback, and certificate eligibility
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test --filter FullyQualifiedName~CapstoneServiceTests`
Expected: FAIL

- [ ] **Step 3: Implement `ICapstoneService` and `CapstoneService`**

Implement rubrics scoring:
- Day 30: 90s Daily Standup (focus on unreleased coda release `/t/`, `/d/`, `/s/`, `/z/`)
- Day 60: 5-Minute Sprint Demo (focus on connected speech linking, flap T, weak forms)
- Day 90: Master 3-in-1 Capstone (Standup + Architecture Sparring + 1-on-1 Sync)
Expose via `Program.cs`.

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test --filter FullyQualifiedName~CapstoneServiceTests`
Expected: PASS

- [ ] **Step 5: Build Capstone Assessment UI & Certificate Modal**

When the learner reaches Day 30, 60, or 90, show a dedicated Capstone examination interface with countdown timer, multi-step prompts, and a downloadable graduation certificate.

- [ ] **Step 6: Commit**

```bash
git add src/DevEngCoach/Services/ICapstoneService.cs src/DevEngCoach/Services/CapstoneService.cs tests/DevEngCoach.Tests/CapstoneServiceTests.cs src/DevEngCoach/Program.cs src/DevEngCoach/wwwroot/
git commit -m "feat(capstone): add milestone assessment engine and graduation certificate for Days 30, 60, and 90"
```

---

### Task 4: Kinematic Vocal Tract Motion Simulator

**Files:**
- Create: `src/DevEngCoach/wwwroot/deveng-kinematic-tract.js`
- Modify: `src/DevEngCoach/wwwroot/fundamentals.html`
- Modify: `src/DevEngCoach/wwwroot/index.html`

**Interfaces:**
- Produces: `<deveng-kinematic-tract>` Web Component
- Visualizes:
  - Dynamic 2D SVG sagittal diagram with animated vector paths for 8 articulators:
    1. Upper & Lower Lips (bilabial closure / rounded)
    2. Upper Teeth (dental / labiodental contact)
    3. Alveolar Ridge (tongue tip tap / seal)
    4. Tongue Tip (apical gestures for `/t/`, `/d/`, `/θ/`, `/ð/`)
    5. Tongue Blade / Body (postalveolar for `/ʃ/`, `/tʃ/`, `/dʒ/`)
    6. Velum / Soft Palate (velar closure for `/k/`, `/ɡ/`, nasal lowering for `/m/`, `/n/`)
    7. Vocal Cords (vibrating frequency ripples for voiced sounds)
    8. Pharyngeal Wall & Airflow Vector (arrows showing plosive release vs continuous fricative stream)
- Methods: `animatePhoneme(phonemeSymbol)`

- [ ] **Step 1: Build the SVG-based kinematic engine in `deveng-kinematic-tract.js`**

Implement SVG morphing/interpolation or dynamic CSS transformation transitions for articulatory motion paths based on articulatory phonetic positions.

- [ ] **Step 2: Connect with 8 Articulators list and Sound Practice modal**

Clicking any articulator or practicing a phoneme automatically triggers the kinematic animation illustrating the mechanical movement.

- [ ] **Step 3: Verify visual animation across Chrome/Edge/Firefox**

Ensure smooth 60fps vector transitions without layout jitter.

- [ ] **Step 4: Commit**

```bash
git add src/DevEngCoach/wwwroot/deveng-kinematic-tract.js src/DevEngCoach/wwwroot/fundamentals.html src/DevEngCoach/wwwroot/index.html
git commit -m "feat(phonetics): add interactive kinematic vocal tract motion animation"
```

---

### Task 5: PWA & Offline Readiness

**Files:**
- Create: `src/DevEngCoach/wwwroot/manifest.json`
- Create: `src/DevEngCoach/wwwroot/sw.js`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/fundamentals.html`

**Interfaces:**
- Service Worker caching strategy: Cache-First for static assets (`styles.css`, `*.js`, `manifest.json`), Network-First for dynamic JSON APIs with offline fallback.
- PWA Manifest: `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`, `icons`.

- [ ] **Step 1: Create `manifest.json`**

Configure web application metadata for standalone window display.

- [ ] **Step 2: Create `sw.js` (Service Worker)**

Implement service worker install, activate, and fetch events with precaching of core assets (`/`, `/index.html`, `/fundamentals.html`, `/styles.css`, `/app.js`, `/deveng-components.js`, `/deveng-command-palette.js`, `/deveng-kinematic-tract.js`).

- [ ] **Step 3: Register Service Worker in HTML files**

Register `navigator.serviceWorker.register('/sw.js')` with status indicator in the footer.

- [ ] **Step 4: Test offline behavior via Chrome DevTools**

Toggle Network to "Offline" in DevTools and confirm the dashboard and fundamentals handbook continue to function smoothly.

- [ ] **Step 5: Commit**

```bash
git add src/DevEngCoach/wwwroot/manifest.json src/DevEngCoach/wwwroot/sw.js src/DevEngCoach/wwwroot/index.html src/DevEngCoach/wwwroot/fundamentals.html
git commit -m "feat(pwa): add PWA manifest and service worker for offline daily study"
```

---

### Task 6: End-to-End Integration Verification & Test Suite

**Files:**
- Modify: `tests/DevEngCoach.Tests/ApiIntegrationTests.cs`

- [ ] **Step 1: Write integration tests covering all new endpoints**

Add integration tests for `/api/backup/export`, `/api/backup/import`, `/api/capstone/30`, `/api/capstone/evaluate`.

- [ ] **Step 2: Run full test suite**

Run: `dotnet test`
Expected: All tests pass (100% success rate).

- [ ] **Step 3: Final Git Commit and Push**

```bash
git add tests/DevEngCoach.Tests/ApiIntegrationTests.cs
git commit -m "test(integration): verify all remaining feature endpoints pass cleanly"
git push origin main
```
