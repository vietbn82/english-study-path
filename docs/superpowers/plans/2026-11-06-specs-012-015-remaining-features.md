# Specs 012–015 Implementation Plan: Ergonomics & Zero-Friction Mastery

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the 4 ergonomic and sensory learning specifications (Specs 012, 013, 014, 015): Slow-Motion Phoneme Playback (0.5x), "Cảm Nhận Cơ Thể" Physical Self-Check Prompts, "Bắt Đầu Ngay" One-Tap Start Hero Screen, and Eyes-Free Audio-Only Mode.

**Architecture:** Frontend extensions built on existing Web Components and Vanilla JS modules in `src/DevEngCoach/wwwroot/`, backed by minimal API extensions in `src/DevEngCoach/Program.cs` and `ProgressService.cs` to track `SessionMode` ("Visual" | "AudioOnly"). Clean separation of concerns with `localStorage`/`sessionStorage` resilience and 100% offline compatibility.

**Tech Stack:** .NET 10 (C# 13 Minimal APIs), Web Speech Synthesis API (`vi-VN` / `en-US`), Web Audio API, xUnit, FluentAssertions, Tailwind CSS, HTML5.

**Spec:**
- `specs/012-slow-motion-playback/spec.md`
- `specs/013-physical-self-check/spec.md`
- `specs/014-one-tap-start/spec.md`
- `specs/015-audio-only-mode/spec.md`

## Global Constraints

- Modern C# 13 with file-scoped namespaces and primary constructors.
- Target framework: `net10.0`.
- Pure client-side Web Audio & Speech Synthesis (zero external heavy libraries).
- All new UI overlays must be non-blocking and keyboard-accessible.
- All existing 138 xUnit tests must continue to pass cleanly.

## Review Focus

1. Web Speech Synthesis missing `vi-VN` voice on some Windows platforms: fallback gracefully to available English voices without throwing unhandled exceptions.
2. Rapid repeated clicks on slow-motion (0.5x) audio buttons: must cancel previous utterance immediately via `speechSynthesis.cancel()` to prevent queued overlapping audio.
3. Adaptive self-check dismissal: ensuring counter does not reset on page navigation if stored in `localStorage`.
4. Hero overlay gating: must never trap user or prevent them from accessing previous days; "Bỏ qua" must dismiss cleanly.
5. Audio-only mode pause/resume state: double-tap gesture must not trigger two sequential pauses.

---

### Task 1: Slow-Motion Phoneme Playback (Spec 012)

**Files:**
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Modify: `src/DevEngCoach/wwwroot/deveng-components.js`
- Modify: `src/DevEngCoach/wwwroot/index.html`

**Interfaces:**
- Produces: `window.setPlaybackSpeed(speed: number)`, `window.getPlaybackSpeed(): number`, `window.playWordSlow(word: string)`
- Speeds: `0.5`, `0.75`, `1.0`, `1.25`
- Storage: `localStorage.getItem('deveng_playback_speed')`

- [ ] **Step 1: Implement global speed state & storage**

In `app.js` and `deveng-components.js`, introduce `getAudioSpeed()` and `setAudioSpeed(rate)` clamping between `0.5` and `1.25` and persisting to `localStorage`.

- [ ] **Step 2: Add 🐢 (0.5x) button next to every 🔊 button**

Update drill word templates in `app.js` to render a 🐢 button with `data-word-slow` that invokes `speakWord(word, 0.5)`.

- [ ] **Step 3: Add Header Speed Selector Badge**

Add a speed toggle badge in the Tier 1/2 header bar allowing cycling: `0.5x -> 0.75x -> 1.0x -> 1.25x`.

- [ ] **Step 4: Implement "🐢 So sánh chậm" for Contrastive Pairs**

Implement sequential A→500ms pause→B playback at 0.5x for minimal pair comparisons.

- [ ] **Step 5: Verify playback behavior**

Run curl/browser check to verify audio triggers at 0.5x and persists across reload.

- [ ] **Step 6: Commit**

```bash
git add src/DevEngCoach/wwwroot/app.js src/DevEngCoach/wwwroot/deveng-components.js src/DevEngCoach/wwwroot/index.html
git commit -m "feat(audio): implement slow-motion phoneme playback and speed selector (spec 012)"
```

---

### Task 2: "Cảm Nhận Cơ Thể" Physical Self-Check Prompts (Spec 013)

**Files:**
- Create: `src/DevEngCoach/wwwroot/tactile-checks.json` (or inline dataset)
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Modify: `src/DevEngCoach/wwwroot/index.html`

**Interfaces:**
- Dataset: `TACTILE_SELF_CHECKS` indexed by category (`Stop`, `Fricative`, `Affricate`, `Nasal`, `Interdental`, `Vowel`).
- Functions: `showTactileCheck(phoneme, word)`, `recordSelfCheckResult(category, isCorrect)`.

- [ ] **Step 1: Define Tactile Checks Catalog**

Catalog 6 tactile categories:
1. Stops: "✋ Đặt lòng bàn tay trước miệng cách 5cm — nhả hơi phải có luồng GIÓ MẠNH phả vào tay."
2. Voiced: "✋ Đặt 2 ngón tay lên hõm cổ họng — phải cảm nhận RUNG nhẹ."
3. Fricatives: "✋ Đặt ngón tay trước miệng — luồng gió rít LIÊN TỤC không ngắt quãng."
4. Interdentals: "✋ Nhìn gương — đầu lưỡi THÈ RA giữa 2 hàm răng 2-3mm."
5. Nasals: "✋ Bịt mũi nói thử — nếu bị nghẹt âm hoàn toàn = bạn làm đúng."
6. Vowels: "✋ Đặt 2 ngón tay dưới cằm — kiểm tra độ căng/chùng cơ hàm."

- [ ] **Step 2: Build non-blocking slide-in UI card**

Add slide-in toast card with "✅ Đã cảm nhận đúng" and "❌ Chưa đúng, thử lại".

- [ ] **Step 3: Implement adaptive frequency control**

Count consecutive correct responses per category in `localStorage`:
- $\ge 5$ correct: show every 3rd word.
- $\ge 10$ correct: auto-hide with manual re-enable.

- [ ] **Step 4: Test adaptive frequency logic**

Simulate 5 and 10 checks, verify appearance rate adjusts as specified.

- [ ] **Step 5: Commit**

```bash
git add src/DevEngCoach/wwwroot/app.js src/DevEngCoach/wwwroot/index.html
git commit -m "feat(phonetics): implement tactile physical self-check prompts and adaptive frequency (spec 013)"
```

---

### Task 3: "Bắt Đầu Ngay" One-Tap Start Hero Screen (Spec 014)

**Files:**
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`

**Interfaces:**
- DOM Element: `#hero-start-overlay`
- Actions:
  - "▶ Bắt Đầu (30 phút)": starts timer, auto-expands Block 1, reveals lesson.
  - "⚡ Quick 10min": opens micro-lesson block selector.
  - "Bỏ qua → Xem bài học": dismisses overlay without starting timer.
- Gating: Show only when today's session is incomplete and not previously dismissed in `sessionStorage`.

- [ ] **Step 1: Add Hero Start Overlay markup**

Render a distraction-free hero card in `#view-workspace` showing:
- Day title & sprint badge
- Current streak ("🔥 14 ngày liên tiếp")
- Single giant button: "▶ Bắt Đầu Ngày [N] (30 phút)"
- Secondary button: "⚡ Quick 10min"
- Text link: "Bỏ qua → Xem bài học"

- [ ] **Step 2: Wire up One-Tap Start handler**

Clicking "▶ Bắt Đầu" dismisses hero, starts the 30-minute timer, expands Block 1 (Phonetics), and chains SRS Warm-Up modal if items are due.

- [ ] **Step 3: Handle completed day state & persistence**

If session is already marked complete, bypass hero overlay automatically.

- [ ] **Step 4: Test zero-friction start in browser**

Verify clicking start transitions smoothly in <500ms with timer ticking.

- [ ] **Step 5: Commit**

```bash
git add src/DevEngCoach/wwwroot/index.html src/DevEngCoach/wwwroot/app.js
git commit -m "feat(ux): implement one-tap start hero screen with pomodoro and srs chaining (spec 014)"
```

---

### Task 4: Audio-Only Mode (Eyes-Free) (Spec 015)

**Files:**
- Modify: `src/DevEngCoach/Services/IProgressService.cs`
- Modify: `src/DevEngCoach/Services/ProgressService.cs`
- Modify: `src/DevEngCoach/Program.cs`
- Modify: `src/DevEngCoach/wwwroot/index.html`
- Modify: `src/DevEngCoach/wwwroot/app.js`
- Create: `tests/DevEngCoach.Tests/AudioOnlyModeTests.cs`

**Interfaces:**
- Backend: `SessionRecord` extended with `string? SessionMode` ("Visual" | "AudioOnly").
- Frontend: `startAudioOnlyMode(lesson)`, `pauseAudioOnlyMode()`, `resumeAudioOnlyMode()`, `repeatAudioOnlySegment()`, `skipAudioOnlyBlock()`.
- Audio Script: Sequenced array of `{ type, textVi, textEn, pauseMs }`.

- [ ] **Step 1: Write backend tests for `SessionMode`**

```csharp
namespace DevEngCoach.Tests;

public class AudioOnlyModeTests
{
    [Fact]
    public void CompleteSession_WithAudioOnlyMode_PersistsSessionMode()
    {
        // Assert session record stores "AudioOnly" mode
    }
}
```

- [ ] **Step 2: Extend backend `CompleteSessionRequest` and `SessionRecord`**

Add `string? SessionMode = "Visual"` to `CompleteSessionRequest` and `SessionRecord` in `IProgressService.cs` and `ProgressService.cs`.

- [ ] **Step 3: Implement Audio Script Sequencer**

In `app.js`, build `generateAudioScript(lesson)` compiling instructions (`mechanicalInstructions`), vocabulary drills, practice pauses, and sentence frames into a playable queue.

- [ ] **Step 4: Implement Eyes-Free Audio Player & Minimal HUD**

Implement audio loop with Web Speech Synthesis (`vi-VN` for guidance, `en-US` for dev targets), Web Audio chime for practice turn, and large 80px play/pause button.

- [ ] **Step 5: Implement Tap Controls & Auto-Dim**

Single-tap to toggle pause, double-tap to repeat item, 30s OLED auto-dim.

- [ ] **Step 6: Run full test suite & verify**

Run `dotnet test` to confirm all unit and integration tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/DevEngCoach/Services/ src/DevEngCoach/wwwroot/ tests/DevEngCoach.Tests/
git commit -m "feat(audio): implement eyes-free audio-only mode with automated script narration (spec 015)"
```
