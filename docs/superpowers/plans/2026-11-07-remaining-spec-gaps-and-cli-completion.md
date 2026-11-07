# Remaining Spec Gaps (002–015) & CLI Companion Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Close all remaining functional gaps across Specs 002–015 and the `deveng` CLI companion: real phonetic transcription fallback & pronunciation accuracy trend charts (Spec 002), partial-session burndown/velocity credit & SRS-backed block recommendations with multi-block upgrade path (Specs 003 & 005), real Web Audio waveform decoding with synced scrubbing & "Save Best" take in Shadowing Studio (Spec 004), Warm-Up summary card & Quick-mode adaptation (Spec 007), Cheat Sheet 1-click frame copy & route alias (Spec 008), configurable 60–90% auto-complete threshold with end-of-session summary card (Spec 009), Hero Start Screen Eyes-Free CTA & SRS/Milestone badges (Specs 014 & 015), and `deveng` CLI `review`, `status`, and `lookup` commands.

**Architecture:** Extend existing .NET 10 Minimal API services (`ISpeechScoringService`, `IProgressService`, `IAnalyticsService`) with strongly-typed C# 13 records and zero external dependencies, backed by xUnit and FluentAssertions tests. Enhance the vanilla ES6+ frontend (`app.js`, `index.html`, `deveng-one-tap-start.js`) and console runner (`src/DevEngCli/Program.cs`) while preserving 100% offline localhost operation.

**Tech Stack:** .NET 10 (C# 13, file-scoped namespaces, primary constructors), ASP.NET Core Minimal APIs, xUnit, FluentAssertions, Vanilla JS (Web Components, Web Audio API `AudioContext.decodeAudioData`, Web Speech API), Tailwind CSS.

**Spec:**
- `specs/002-pronunciation-scorer/spec.md`
- `specs/003-streak-burndown-dashboard/spec.md`
- `specs/004-shadowing-playback/spec.md`
- `specs/005-micro-lesson-mode/spec.md`
- `specs/007-srs-warmup/spec.md`
- `specs/008-sprint-cheat-sheet/spec.md`
- `specs/009-auto-complete-threshold/spec.md`
- `specs/014-one-tap-start/spec.md`
- `specs/015-audio-only-mode/spec.md`
- `docs/superpowers/plans/2026-11-05-awesome-utility-suite.md`

## Global Constraints

- Modern C# 13 with file-scoped namespaces and primary constructors.
- Target framework: `net10.0`.
- 100% offline resilience on `localhost` with zero external JS/CSS CDN dependencies for new components.
- All notifications in the web UI must use the non-blocking toast stack (`window.showDevEngToast`).
- All 143 existing xUnit tests plus all new unit/integration tests must pass via `dotnet test DevEngCoach.slnx`.

## Review Focus

1. Empty, silent, or Vietnamese-accented input sent to `/api/speech/transcribe`: must return structured diagnostic flags (`IsSilent`, `IsVietnameseDetected`, `NoiseWarning`) rather than throwing 500 or returning a hardcoded string.
2. Upgrading a `CompletedPartial` session to `Completed`: completing remaining blocks on the same day must merge `BlocksCompleted` without duplicating the session or double-counting the daily streak.
3. Custom auto-complete threshold outside `{60, 70, 80, 90}`: backend must clamp/normalize invalid threshold percentages to `70` and compute required words as `Math.Max(1, (int)Math.Floor(totalWords * threshold / 100.0))`.
4. Corrupted or empty audio blob in Shadowing `decodeAudioData`: must catch decode errors gracefully, display a "Recording appears silent. Check your microphone." toast when peak amplitude `< 0.02`, and avoid breaking the canvas renderer.
5. `deveng` CLI commands invoked non-interactively (e.g., `deveng review --once`, `deveng status`, `deveng lookup auth`): must exit cleanly with code `0` without hanging on `Console.ReadLine()`.

---

### Task 1: Phonetic Transcription Fallback & Pronunciation Analytics Trends (Spec 002)

**Files:**
- Modify: `src/DevEngCoach/Common/SpeechScoringModels.cs`
- Modify: `src/DevEngCoach/Services/ISpeechScoringService.cs`
- Modify: `src/DevEngCoach/Services/SpeechScoringService.cs`
- Modify: `src/DevEngCoach/Program.cs:221-244`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Test: `tests/DevEngCoach.Tests/SpeechScoringServiceTests.cs`

**Interfaces:**
- Produces:
  - `SpeechTranscribeRequest(string? SpokenHint, string? TargetText, int DayNumber = 1, double? PeakAmplitude = null)`
  - `SpeechTranscribeResponse(string TranscribedText, double Confidence, bool IsSilent, bool IsVietnameseDetected, string? DiagnosticWarning)`
  - `Task<SpeechTranscribeResponse> ISpeechScoringService.TranscribeFallbackAsync(SpeechTranscribeRequest request, CancellationToken ct = default)`
- Endpoint: `POST /api/speech/transcribe`

- [x] **Step 1: Write the failing unit tests in `tests/DevEngCoach.Tests/SpeechScoringServiceTests.cs`**

```csharp
[Fact]
public async Task TranscribeFallbackAsync_WithSilentAmplitude_ReturnsSilenceWarning()
{
    var service = CreateService();
    var result = await service.TranscribeFallbackAsync(new SpeechTranscribeRequest(
        SpokenHint: "",
        TargetText: "method",
        DayNumber: 1,
        PeakAmplitude: 0.005
    ));

    result.IsSilent.Should().BeTrue();
    result.DiagnosticWarning.Should().Contain("No speech detected");
}

[Fact]
public async Task TranscribeFallbackAsync_WithVietnameseDiacritics_FlagsVietnameseMismatch()
{
    var service = CreateService();
    var result = await service.TranscribeFallbackAsync(new SpeechTranscribeRequest(
        SpokenHint: "phương thức xác thực",
        TargetText: "authentication method",
        DayNumber: 1
    ));

    result.IsVietnameseDetected.Should().BeTrue();
    result.DiagnosticWarning.Should().Contain("Vietnamese");
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `dotnet test DevEngCoach.slnx --filter FullyQualifiedName~SpeechScoringServiceTests`
Expected: FAIL with compilation error (`SpeechTranscribeRequest` and `TranscribeFallbackAsync` not defined).

- [x] **Step 3: Implement `TranscribeFallbackAsync` in `SpeechScoringService.cs` and wire `POST /api/speech/transcribe` in `Program.cs`**

Add `SpeechTranscribeRequest` and `SpeechTranscribeResponse` to `SpeechScoringModels.cs`. Detect silence when `PeakAmplitude is < 0.02` and `string.IsNullOrWhiteSpace(SpokenHint)`, detect Vietnamese characters via regex `[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]`, and map `/api/speech/transcribe` in `Program.cs` to `speechService.TranscribeFallbackAsync(...)`. In `index.html` (`#view-analytics`) and `app.js` (`refreshAnalyticsData`), fetch `/api/speech/scores/summary` and `/api/speech/scores/history` to render the Phoneme Category Accuracy bars and recent Drill Score Trend line.

- [x] **Step 4: Run test to verify it passes**

Run: `dotnet test DevEngCoach.slnx --filter FullyQualifiedName~SpeechScoringServiceTests`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/DevEngCoach/Common/SpeechScoringModels.cs src/DevEngCoach/Services/ISpeechScoringService.cs src/DevEngCoach/Services/SpeechScoringService.cs src/DevEngCoach/Program.cs src/DevEngCoach/wwwroot/index.html src/DevEngCoach/wwwroot/app.js tests/DevEngCoach.Tests/SpeechScoringServiceTests.cs
git commit -m "feat(speech): implement diagnostic transcribe fallback and pronunciation analytics trends (spec 002)"
```

---

### Task 2: Partial-Session Analytics Credit, Multi-Block Upgrade Path & Smart Recommendations (Specs 003 & 005)

**Files:**
- Modify: `src/DevEngCoach/Common/ProgressLog.cs`
- Modify: `src/DevEngCoach/Common/MicroLessonModels.cs`
- Modify: `src/DevEngCoach/Common/AnalyticsModels.cs`
- Modify: `src/DevEngCoach/Services/ProgressService.cs`
- Modify: `src/DevEngCoach/Services/AnalyticsService.cs`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Test: `tests/DevEngCoach.Tests/MicroLessonTests.cs`
- Test: `tests/DevEngCoach.Tests/AnalyticsServiceTests.cs`

**Interfaces:**
- Extends `SessionLog`: add `IReadOnlyList<string>? BlocksCompleted = null`, `string? CompletionMode = "Manual"`
- Extends `BlockRecommendation`: `int WeakSpotCount = 0`, `int DaysSinceLastSpeaking = 0`, `bool ShowConsecutivePartialNudge = false`
- Extends `AnalyticsOverview`: add `BlockFrequencySummary BlockFrequency` (`int PhoneticsDays`, `int FramesDays`, `int OutputDays`, `int FullSessionsCount`, `int PartialSessionsCount`, `int AudioOnlySessionsCount`)

- [x] **Step 1: Write the failing unit tests in `tests/DevEngCoach.Tests/MicroLessonTests.cs` and `AnalyticsServiceTests.cs`**

```csharp
[Fact]
public void MicroCompleteSession_AllThreeBlocksCompleted_UpgradesStatusToCompleted()
{
    var service = CreateProgressService();
    service.MicroCompleteSession(new MicroSessionRequest(1, "Phonetics", 10));
    service.MicroCompleteSession(new MicroSessionRequest(1, "Frames", 10));
    var finalLog = service.MicroCompleteSession(new MicroSessionRequest(1, "Output", 10));

    finalLog.Status.Should().Be("Completed");
    finalLog.ActualMinutes.Should().Be(30);
    finalLog.BlocksCompleted.Should().BeEquivalentTo(["Phonetics", "Frames", "Output"]);
}

[Fact]
public async Task GetBurndownDataAsync_CountsCompletedPartialTowardProgress()
{
    // Verify CompletedPartial sessions reduce actualRemainingDays in BurndownData and count in WeeklyVelocity
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `dotnet test DevEngCoach.slnx --filter "FullyQualifiedName~MicroLessonTests|FullyQualifiedName~AnalyticsServiceTests"`
Expected: FAIL

- [x] **Step 3: Implement multi-block merging, SRS-aware `GetRecommendation`, and partial-session analytics in `ProgressService.cs` and `AnalyticsService.cs`**

In `ProgressService.MicroCompleteSession`, merge `request.SelectedBlock` into the existing day's `BlocksCompleted` list and sum `ActualMinutes`; if all 3 blocks (`Phonetics`, `Frames`, `Output`) are present, upgrade `Status` to `"Completed"`. Inject `ISrsService` into `ProgressService` (optional parameter with null fallback for existing tests) so `GetRecommendation()` recommends `"Phonetics"` when `srs.GetDueItems().Count >= 5` and sets `ShowConsecutivePartialNudge = true` when the last 5 completed sessions are all `"CompletedPartial"`. In `AnalyticsService`, count both `"Completed"` and `"CompletedPartial"` in burndown and weekly velocity, and render the Block Completion Frequency & Session Mode summary in `#view-analytics`.

- [x] **Step 4: Run test to verify it passes**

Run: `dotnet test DevEngCoach.slnx --filter "FullyQualifiedName~MicroLessonTests|FullyQualifiedName~AnalyticsServiceTests"`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/DevEngCoach/Common/ src/DevEngCoach/Services/ProgressService.cs src/DevEngCoach/Services/AnalyticsService.cs src/DevEngCoach/wwwroot/ tests/DevEngCoach.Tests/
git commit -m "feat(microlesson): support 3-block upgrade to full completion, SRS smart recommendation, and partial analytics (specs 003, 005)"
```

---

### Task 3: Configurable Auto-Complete Threshold (60–90%) & Session Completion Summary Card (Spec 009)

**Files:**
- Modify: `src/DevEngCoach/Common/AutoCompleteModels.cs`
- Modify: `src/DevEngCoach/Program.cs:311-358`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Test: `tests/DevEngCoach.Tests/AutoCompleteThresholdTests.cs`

**Interfaces:**
- Extends `DrillThresholdCheckRequest`: add `int ThresholdPercentage = 70`, `IReadOnlyList<string>? CorrectWords = null`
- Extends `DrillThresholdCheckResponse`: add `int RequiredWordsCount`, `string CompletionMode` (`"Perfect"` | `"AutoThreshold"` | `"Pending"`), `IReadOnlyList<string> NailedWords`, `int CurrentStreakDays`

- [x] **Step 1: Write the failing unit/integration tests in `tests/DevEngCoach.Tests/AutoCompleteThresholdTests.cs`**

```csharp
[Theory]
[InlineData(10, 6, 60, true, "AutoThreshold")]
[InlineData(10, 7, 80, false, "Pending")]
[InlineData(10, 8, 80, true, "AutoThreshold")]
[InlineData(5, 3, 70, true, "AutoThreshold")] // floor(5 * 0.7) = 3
[InlineData(10, 10, 70, true, "Perfect")]
public async Task CheckThreshold_RespectsConfiguredPercentageAndProportionalFloor(
    int total, int correct, int thresholdPct, bool expectedReached, string expectedMode)
{
    // POST /api/drill/check-threshold and assert ThresholdReached and CompletionMode
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `dotnet test DevEngCoach.slnx --filter FullyQualifiedName~AutoCompleteThresholdTests`
Expected: FAIL

- [x] **Step 3: Update `/api/drill/check-threshold` in `Program.cs` and wire the frontend Threshold Selector & Summary Card**

In `Program.cs`, clamp `ThresholdPercentage` to `{60, 70, 80, 90}` (default `70`), calculate `requiredCount = Math.Max(1, (int)Math.Floor(total * validThreshold / 100.0))`, set `CompletionMode = correct >= total ? "Perfect" : (reached ? "AutoThreshold" : "Pending")`, and deduplicate SRS enrollment via `ISrsService.AutoEnrollWeakSpot`. In `index.html` and `app.js`, add a Threshold Selector pill (`60% | 70% | 80% | 90%`) persisted in `localStorage` (`deveng_autocomplete_threshold`) and render the End-of-Session Summary Card inside `#autocomplete-celebration` showing ✅ Nailed words (green), 📌 Review Tomorrow words (orange), and 🔥 Streak.

- [x] **Step 4: Run test to verify it passes**

Run: `dotnet test DevEngCoach.slnx --filter FullyQualifiedName~AutoCompleteThresholdTests`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/DevEngCoach/Common/AutoCompleteModels.cs src/DevEngCoach/Program.cs src/DevEngCoach/wwwroot/index.html src/DevEngCoach/wwwroot/app.js tests/DevEngCoach.Tests/AutoCompleteThresholdTests.cs
git commit -m "feat(drill): add configurable 60-90% auto-complete threshold and session summary card (spec 009)"
```

---

### Task 4: Shadowing Real Web Audio Waveform Decoding, Synced Scrubbing & "Save Best" Take (Spec 004)

**Files:**
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js:4090-4300`

**Interfaces:**
- Produces:
  - `extractWaveformPeaksFromBlob(blob: Blob, barCount?: number): Promise<{ peaks: number[], maxAmplitude: number, durationSeconds: number }>`
  - `scrubShadowingWaveform(progressRatio: number): void`
  - `saveBestShadowingTake(): Promise<void>` & `playSavedBestShadowingTake(): void` (persisted in `localStorage` under `deveng_shadow_best_day_${day}`)

- [x] **Step 1: Implement `extractWaveformPeaksFromBlob` using `AudioContext.decodeAudioData` in `app.js`**

Replace the hardcoded `[25, 55, 75...]` array in `toggleShadowingRecording()` with real PCM channel peak extraction from `shadowingState.userAudioBlob`. If `maxAmplitude < 0.02`, show toast `"⚠️ Bản thu quá nhỏ hoặc im lặng. Vui lòng kiểm tra lại microphone."`.

- [x] **Step 2: Add click-to-scrub on `#canvas-shadow-ref` & `#canvas-shadow-user` and `⭐ Lưu Bản Tốt Nhất` button**

In `index.html` (`#view-shadowing`) and `app.js` (`setupShadowingControls`), bind click listeners on both canvases to draw a vertical playhead marker at `offsetX / canvas.width` and seek `shadowingState.userAudioElement.currentTime = ratio * duration`. Add `#btn-shadow-save-best` (`⭐ Lưu Bản Tốt Nhất`) and `#btn-shadow-play-best` (`▶ Nghe Bản Tốt Nhất`) storing base64 audio per day in `localStorage`.

- [x] **Step 3: Verify build and test suite**

Run: `dotnet test DevEngCoach.slnx`
Expected: PASS (100% tests green).

- [x] **Step 4: Commit**

```bash
git add src/DevEngCoach/wwwroot/index.html src/DevEngCoach/wwwroot/app.js
git commit -m "feat(shadowing): decode real PCM waveform peaks, add canvas scrubbing, and save best recording (spec 004)"
```

---

### Task 5: Cheat Sheet 1-Click Copy, Warm-Up Summary Card & Hero Eyes-Free / Milestone Badges (Specs 007, 008, 014, 015)

**Files:**
- Modify: `src/DevEngCoach/Program.cs:306-310`
- Modify: `src/DevEngCoach/wwwroot/app.js:4543-4762`
- Modify: `src/DevEngCoach/wwwroot/deveng-one-tap-start.js`
- Test: `tests/DevEngCoach.Tests/CheatSheetServiceTests.cs`

**Interfaces:**
- Endpoint alias: `GET /api/curriculum/cheatsheet/{sprintId:int}` (Spec 008 FR-005) alongside `GET /api/cheatsheet/{sprintId:int}`
- Hero component (`<deveng-one-tap-hero>`): adds `#deveng-hero-btn-audio` (`🎧 Chế độ Nghe (Eyes-Free)`), `#deveng-hero-srs-badge` (`🧠 N từ cần ôn`), and `#deveng-hero-milestone-badge` (shown on Days 30, 60, 90)
- Warm-Up (`startWarmupRound(options)`): accepts `{ isQuickMode: boolean }` (1 min / 3 words when `isQuickMode === true`) and renders a summary view (`X/Y đúng · 📌 Từ cần chú ý: [FocusWord]`) before closing

- [x] **Step 1: Write the failing route integration test in `tests/DevEngCoach.Tests/ApiIntegrationTests.cs`**

```csharp
[Fact]
public async Task GetCurriculumCheatSheetAlias_ReturnsValidSprintCheatSheet()
{
    var response = await _client.GetAsync("/api/curriculum/cheatsheet/1");
    response.EnsureSuccessStatusCode();
    var sheet = await response.Content.ReadFromJsonAsync<SprintCheatSheet>();
    sheet.Should().NotBeNull();
    sheet!.SprintId.Should().Be(1);
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `dotnet test DevEngCoach.slnx --filter FullyQualifiedName~GetCurriculumCheatSheetAlias`
Expected: FAIL (404 Not Found).

- [x] **Step 3: Map `/api/curriculum/cheatsheet/{sprintId:int}`, add 1-click frame copy in `app.js`, Warm-Up summary card, and Hero Eyes-Free button**

1. In `Program.cs`, add `curriculumApi.MapGet("/cheatsheet/{sprintId:int}", (int sprintId, ICheatSheetService cheatSheet) => Results.Ok(cheatSheet.GetSprintCheatSheet(sprintId)));`.
2. In `renderCheatSheetBody(sheet)` (`app.js`), add a `.btn-copy-frame` (`📋 Copy`) button on each sentence frame card that copies `f.templatePattern` via `navigator.clipboard.writeText` and calls `window.showDevEngToast('Đã sao chép khung câu! ✅', 'success')`.
3. In `setupSrsWarmup()` (`app.js`), track `warmupCorrectCount` and `warmupFailedItems`; when all items finish, display a summary card inside `#modal-srs-warmup` with accuracy and the focus word before transitioning to the lesson.
4. In `deveng-one-tap-start.js`, render `#deveng-hero-srs-badge`, `#deveng-hero-milestone-badge` (for Day 30/60/90), and `#deveng-hero-btn-audio` (`🎧 Chế độ Nghe (Eyes-Free)`) which dismisses the hero and triggers `document.getElementById('nav-audio-only')?.click()`.

- [x] **Step 4: Run test to verify it passes**

Run: `dotnet test DevEngCoach.slnx`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/DevEngCoach/Program.cs src/DevEngCoach/wwwroot/app.js src/DevEngCoach/wwwroot/deveng-one-tap-start.js tests/DevEngCoach.Tests/ApiIntegrationTests.cs
git commit -m "feat(ux): add cheatsheet copy, warmup summary card, and hero eyes-free CTA (specs 007, 008, 014, 015)"
```

---

### Task 6: `deveng` Terminal CLI Expansion (`review`, `status`, `lookup`) (`src/DevEngCli`)

**Files:**
- Modify: `src/DevEngCli/Program.cs`
- Create: `tests/DevEngCoach.Tests/DevEngCliTests.cs`

**Interfaces:**
- CLI commands in `DevEngCli.Program.Main(string[] args)`:
  - `deveng status`: Prints 90-day streak, completed days, plan vs. actual minutes, SRS due count, and today's lesson summary.
  - `deveng lookup <term>`: Prints IPA symbol, Vietnamese equivalent, physical mouth cue, and Senior Dev example sentence using `AiCoachService` / `IpaGlossaryService`.
  - `deveng review [--once]`: Runs an interactive (or single-card non-interactive with `--once`) SRS Leitner weak-spot review in the terminal.

- [x] **Step 1: Write the failing CLI unit tests in `tests/DevEngCoach.Tests/DevEngCliTests.cs`**

Add project reference to `src/DevEngCli/DevEngCli.csproj` in `tests/DevEngCoach.Tests/DevEngCoach.Tests.csproj` (or test the command handlers directly) and assert:

```csharp
[Fact]
public async Task Main_StatusCommand_ReturnsZeroExitCode()
{
    var exitCode = await DevEngCli.Program.Main(["status"]);
    exitCode.Should().Be(0);
}

[Fact]
public async Task Main_LookupCommand_WithValidTerm_ReturnsZeroExitCode()
{
    var exitCode = await DevEngCli.Program.Main(["lookup", "idempotent"]);
    exitCode.Should().Be(0);
}

[Fact]
public async Task Main_ReviewCommand_WithOnceFlag_ReturnsZeroExitCode()
{
    var exitCode = await DevEngCli.Program.Main(["review", "--once"]);
    exitCode.Should().Be(0);
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `dotnet test DevEngCoach.slnx --filter FullyQualifiedName~DevEngCliTests`
Expected: FAIL (`Unknown command: 'status'` returns `1`).

- [x] **Step 3: Implement `status`, `lookup`, and `review` commands in `src/DevEngCli/Program.cs`**

Add `"status" => HandleStatusCommand()`, `"lookup" => await HandleLookupCommandAsync(remainingArgs)`, and `"review" => HandleReviewCommand(remainingArgs)` to the command switch in `src/DevEngCli/Program.cs`, and update `ShowHelp()` with the new commands.

- [x] **Step 4: Run full test suite to verify all tests pass**

Run: `dotnet test DevEngCoach.slnx`
Expected: PASS (0 failures across all unit, integration, and CLI tests).

- [x] **Step 5: Commit**

```bash
git add src/DevEngCli/Program.cs tests/DevEngCoach.Tests/DevEngCoach.Tests.csproj tests/DevEngCoach.Tests/DevEngCliTests.cs
git commit -m "feat(cli): add status, lookup, and interactive srs review commands to deveng CLI"
```
