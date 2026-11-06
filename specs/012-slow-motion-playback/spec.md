# Feature Specification: Slow-Motion Phoneme Playback

**Feature Branch**: `012-slow-motion-playback`  
**Created**: 2026-11-06  
**Status**: Draft  
**Input**: User description: "Add a 0.5x speed button next to every 🔊. Vietnamese learners can't hear the difference between /θ/ and /t/ at native speed — slowed audio reveals the airflow difference."

---

## User Scenarios & Testing

### User Story 1 - Speed Toggle on All Audio Playback Buttons (Priority: P1)

As a Vietnamese developer with poor auditory perception, I want a 0.5x slow-motion option next to every 🔊 audio button so that I can hear the subtle differences between phonemes (like `/θ/` vs `/t/`, `/s/` vs `/z/`) that are impossible to distinguish at native speed.

**Why this priority**: The constitution identifies poor auditory perception as the #1 barrier. If the learner can't hear the target sound clearly, no amount of kinesthetic instruction helps — they don't know what they're aiming for.

**Independent Test**: On Day 1, click the 🔊 button for "commit" — hear it at 1x. Click the 🐢 button — hear the same word at 0.5x speed with each phoneme stretched. Verify `/t/` ending burst is audibly distinct at 0.5x.

**Acceptance Scenarios**:

1. **Given** a vocabulary drill word "commit" with a 🔊 button, **When** the user clicks 🐢 (0.5x), **Then** the word plays at half speed via `SpeechSynthesisUtterance.rate = 0.5`, making the final `/t/` burst clearly audible.
2. **Given** a contrastive pair `/θ/` vs `/ð/`, **When** the user clicks 🐢 on each side, **Then** both sounds play at 0.5x, making the voicing difference (cổ rung vs không rung) unmistakable.
3. **Given** a sentence frame "Yesterday, I focused on the deployment", **When** the user clicks 🐢, **Then** the entire sentence plays at 0.5x with natural prosody preserved (not robotic).
4. **Given** the 🐢 button is clicked while audio is already playing at 1x, **When** clicked, **Then** current playback stops and restarts at 0.5x.

---

### User Story 2 - Multi-Speed Selector (Priority: P2)

As a learner progressing through the 90 days, I want to choose from multiple speeds (0.5x, 0.75x, 1x, 1.25x) so that I can gradually train my ear from slow to native speed as my perception improves.

**Why this priority**: 0.5x is training wheels. As the learner improves, they need intermediate speeds to bridge the gap to native-speed comprehension.

**Independent Test**: Click the speed selector, choose 0.75x, play a word, verify it plays at 0.75x. Switch to 1.25x, verify faster playback.

**Acceptance Scenarios**:

1. **Given** the user clicks the speed indicator badge (showing "1x"), **When** a dropdown/cycle appears, **Then** options are: 🐢 0.5x, 0.75x, 1x (default), 🐇 1.25x.
2. **Given** the user selects 0.75x, **When** any 🔊 button is clicked afterwards, **Then** all audio plays at 0.75x until changed. The selected speed persists across the session.
3. **Given** the user's preferred speed is stored, **When** they reload the page, **Then** the last-used speed is restored from `localStorage`.

---

### User Story 3 - Slow Playback for Contrastive Pair A/B Comparison (Priority: P2)

As a learner drilling minimal pairs, I want a "🐢 So sánh chậm" button that plays Sound A at 0.5x, pauses 500ms, then plays Sound B at 0.5x automatically, so that I can clearly hear the contrast without clicking multiple buttons.

**Why this priority**: Minimal pair discrimination is the core ear-training exercise. Sequential slow playback makes the contrast maximally obvious.

**Independent Test**: On the `/t/` vs `/d/` contrastive pair, click "🐢 So sánh chậm", verify "test" plays at 0.5x, 500ms pause, then "dead" plays at 0.5x.

**Acceptance Scenarios**:

1. **Given** a contrastive pair `/t/` (test) vs `/d/` (dead), **When** the user clicks "🐢 So sánh chậm", **Then** "test" plays at 0.5x → 500ms silence → "dead" plays at 0.5x, with visual indicator highlighting which word is currently playing.
2. **Given** the sequential playback is in progress, **When** the user clicks Stop, **Then** all audio stops immediately.

---

### Edge Cases

- What if the browser's TTS engine doesn't support rates below 0.5? → Clamp to the minimum supported rate; show "Tốc độ thấp nhất được hỗ trợ" if 0.5x is unavailable.
- Does slow playback work with pre-recorded audio files (not TTS)? → Yes, use `HTMLAudioElement.playbackRate = 0.5`. Both TTS and file-based audio support rate adjustment.
- What about pitch shifting at slow speeds? → Web Speech API preserves pitch when slowing down. For `<audio>` elements, `preservesPitch = true` (default in modern browsers).
- What if the user has audio-only mode active? → Slow speed setting applies globally, including audio-only mode narration.

## Requirements

### Functional Requirements

- **FR-001 (0.5x Button)**: Every 🔊 audio playback button MUST have an adjacent 🐢 slow-motion button or a speed toggle that plays at 0.5x rate.
- **FR-002 (TTS Rate Control)**: For Web Speech Synthesis playback, system MUST set `SpeechSynthesisUtterance.rate` to the selected speed value.
- **FR-003 (Audio Element Rate)**: For `<audio>` element playback (pre-recorded files), system MUST set `HTMLAudioElement.playbackRate` with `preservesPitch = true`.
- **FR-004 (Multi-Speed Options)**: System MUST support at least 4 speeds: 0.5x, 0.75x, 1.0x, 1.25x.
- **FR-005 (Speed Persistence)**: Selected playback speed MUST persist in `localStorage` across page reloads.
- **FR-006 (Contrastive Slow Compare)**: Contrastive pair sections MUST include a "🐢 So sánh chậm" button for sequential A→pause→B playback at slow speed.
- **FR-007 (Visual Speed Indicator)**: Current playback speed MUST be shown as a small badge (e.g., "0.5x") near the audio controls so the user always knows the active speed.
- **FR-008 (Global Speed Setting)**: Speed setting MUST apply globally — changing speed in one drill affects all subsequent audio playback site-wide until changed again.

### Key Entities

- **PlaybackSettings**: `currentSpeed` (0.5 | 0.75 | 1.0 | 1.25), `lastModified` (timestamp).

---

## Success Criteria

- **SC-001**: Audio at 0.5x makes ending consonant bursts (`/t/`, `/d/`, `/s/`) individually distinguishable (validated by user test).
- **SC-002**: Speed toggle responds in <100ms with no audio glitch or restart delay.
- **SC-003**: Speed persistence works across reload 100% of the time.

---

## Assumptions & Boundaries

- Pure frontend feature. No backend changes.
- Primary audio source is Web Speech Synthesis API (TTS). Pre-recorded audio file support is secondary.
- No pitch correction library needed — modern browsers handle `preservesPitch` natively.
- Speed setting is a single global value, not per-word or per-block.
