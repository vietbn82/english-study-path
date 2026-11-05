# Feature Specification: Shadowing Mode with Playback Comparison

**Feature Branch**: `004-shadowing-playback`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Record user audio alongside a reference audio clip. Play them back-to-back (or waveform overlay) so the learner can see timing/intonation differences visually, not just hear them."

---

## User Scenarios & Testing

### User Story 1 - Reference Audio Playback & User Recording (Priority: P1)

As a learner practicing sentence frames, I want to first hear a reference audio clip of the target sentence spoken naturally, then immediately record myself saying the same sentence, so that I can practice shadowing with a clear model to imitate.

**Why this priority**: The record-and-compare loop is the fundamental interaction. Without reliable playback and recording, no comparison is possible.

**Independent Test**: Open Day 5 lesson, click Play on the sentence frame "Yesterday, I focused on the deployment pipeline", hear the reference audio, then click Record, speak the sentence, and verify both audio clips are available for playback.

**Acceptance Scenarios**:

1. **Given** a lesson sentence frame has a reference audio file (pre-generated TTS or pre-recorded), **When** the user clicks the ▶️ Reference button, **Then** the reference audio plays with a visible playback progress bar.
2. **Given** the reference audio has finished playing, **When** the user clicks 🎤 Record My Version, **Then** the browser captures audio via MediaRecorder, shows a recording indicator with elapsed time, and stores the recording as a Blob in memory.
3. **Given** the user has recorded their version, **When** recording stops (manual or 15-second auto-stop), **Then** both the reference and user recordings are available as side-by-side playback controls.
4. **Given** the user wants to re-record, **When** they click 🔄 Re-record, **Then** the previous recording is discarded and a new recording session starts.

---

### User Story 2 - Side-by-Side & Back-to-Back Playback (Priority: P2)

As a learner, I want to play the reference and my recording back-to-back (reference first, then mine) or toggle between them with a single click, so that I can hear the differences in pronunciation, rhythm, and intonation without fumbling between controls.

**Why this priority**: Comparison playback is where learning happens — the learner's ear develops by hearing the gap between model and self.

**Independent Test**: Record a sentence, then click "Compare" to hear reference → user back-to-back with a 500ms gap, and verify both play sequentially without manual intervention.

**Acceptance Scenarios**:

1. **Given** both reference and user recordings exist, **When** the user clicks "▶️ Compare (Back-to-Back)", **Then** the reference plays first, followed by a 500ms pause, then the user recording plays automatically.
2. **Given** both recordings exist, **When** the user clicks "🔀 Toggle A/B", **Then** each click alternates playback between reference and user recording, with a visual indicator showing which is currently playing ("Reference 🔊" vs "You 🔊").
3. **Given** playback is in progress, **When** the user clicks Stop, **Then** all audio stops immediately and playback position resets.

---

### User Story 3 - Visual Waveform Comparison (Priority: P3)

As a kinesthetic learner who struggles with auditory perception, I want to see the audio waveforms of both the reference and my recording displayed as overlaid or stacked visualizations, so that I can visually identify where my timing is off, where I'm rushing or pausing, and where my volume/emphasis differs.

**Why this priority**: The constitution explicitly states this learner has poor auditory perception. Visual waveform comparison converts an audio problem into a visual-spatial problem, which aligns with the kinesthetic learning approach.

**Independent Test**: Record a sentence, verify two waveform visualizations render (reference on top, user on bottom), with time-aligned axes so timing differences are visually apparent.

**Acceptance Scenarios**:

1. **Given** both reference and user recordings exist, **When** the comparison view loads, **Then** two waveform canvases render vertically stacked: reference (blue) on top, user (orange) on bottom, sharing the same time axis.
2. **Given** the user spoke faster than the reference, **When** waveforms render, **Then** the user's waveform is visibly shorter/compressed compared to the reference, making the timing difference obvious.
3. **Given** the user dropped the ending of a word (e.g., silent `/t/` on "focused"), **When** waveforms render, **Then** the user's waveform shows reduced amplitude at the word-end compared to the reference's clear consonant burst.
4. **Given** the user clicks a point on either waveform, **When** clicked, **Then** playback starts from that timestamp on both waveforms simultaneously (synced scrubbing).

---

### User Story 4 - AI Shadowing Feedback (Priority: P3)

As a learner, I want the AI Coach to analyze the differences between my recording and the reference and provide specific feedback (e.g., "You rushed the middle of the sentence — pause after 'focused on'", "Your /t/ on 'deployment' was dropped"), so that I get actionable coaching beyond what I can see/hear myself.

**Why this priority**: Combines the visual feedback with AI-powered kinesthetic correction tips, making the shadowing exercise a complete learning loop.

**Independent Test**: Record a sentence with intentional errors, submit for AI analysis, verify feedback includes timing notes and phoneme-specific corrections.

**Acceptance Scenarios**:

1. **Given** both recordings exist, **When** the user clicks "🤖 Get AI Feedback", **Then** both audio transcriptions are sent to the AI Coach via `/api/ai/evaluate` with a shadowing-specific prompt, and feedback returns within 5 seconds.
2. **Given** the AI detects the user spoke 40% faster than the reference, **When** feedback renders, **Then** it includes: "Pacing: You completed the sentence in 2.1s vs the reference's 3.5s. Try slowing down — natural English uses stress-timing, not syllable-timing."
3. **Given** the AI detects a dropped ending consonant, **When** feedback renders, **Then** it includes the specific kinesthetic correction from the curriculum (e.g., "'/t/' on 'focused': Tongue tip must tap alveolar ridge and release a burst of air").

---

### Edge Cases

- What happens when no reference audio exists for a lesson? → Generate reference audio on-the-fly using Web Speech Synthesis API (TTS fallback), clearly labeled as "Generated reference".
- What if the user's recording is mostly silence? → Detect via amplitude analysis and prompt: "Recording appears silent. Check your microphone."
- How are very long recordings handled? → Auto-stop at 30 seconds for sentence frames, 120 seconds for full standup/demo practice.
- What about audio format compatibility? → Record as WebM/Opus (Chrome default), convert to WAV on server if needed for analysis.
- What if the user wants to save their best recording? → Provide a "⭐ Save Best" button that persists the audio blob to local storage or server for later review.

## Requirements

### Functional Requirements

- **FR-001 (Reference Audio)**: System MUST provide reference audio for every sentence frame and vocabulary word. Sources: pre-recorded audio files in `wwwroot/audio/`, or Web Speech Synthesis API (TTS) as fallback.
- **FR-002 (User Recording)**: System MUST capture user audio via MediaRecorder API with visual recording indicator and configurable auto-stop (default: 15s for words, 30s for sentences).
- **FR-003 (Back-to-Back Playback)**: System MUST support sequential playback (reference → 500ms pause → user) with a single button click.
- **FR-004 (A/B Toggle)**: System MUST support instant toggle between reference and user audio with visual indicator of active source.
- **FR-005 (Waveform Rendering)**: System MUST render audio waveforms using Web Audio API's `AnalyserNode` and HTML5 Canvas, displayed as amplitude-over-time plots.
- **FR-006 (Stacked Waveform Layout)**: Reference and user waveforms MUST be vertically stacked with a shared time axis for visual alignment.
- **FR-007 (Synced Scrubbing)**: Clicking a position on either waveform MUST start playback from that time position on both tracks.
- **FR-008 (AI Shadowing Analysis)**: System MUST send both transcriptions to `/api/ai/evaluate` with a shadowing-specific prompt template that requests pacing, rhythm, and phoneme-level comparison.
- **FR-009 (Re-record)**: System MUST allow unlimited re-recording, replacing the previous user recording each time.
- **FR-010 (No Server-Side Audio Storage by Default)**: Audio blobs are kept in browser memory/session only. Optional "Save Best" persists to `localStorage` or server.

### Key Entities

- **ShadowingSession**: `SessionId`, `DayNumber`, `TargetText`, `ReferenceAudioUrl`, `UserAudioBlob` (client-side), `ReferenceTranscription`, `UserTranscription`, `AiFeedback`, `CreatedAt`.
- **ShadowingFeedback**: `PacingDelta` (percentage faster/slower), `DroppedPhonemes[]`, `RhythmNotes`, `OverallRating` (1-5), `KinestheticTips[]`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Recording Latency)**: Time from clicking Record to audio capture starting is <300ms.
- **SC-002 (Waveform Render)**: Both waveforms render within 500ms after recording stops.
- **SC-003 (Comparison Usability)**: Back-to-back playback executes with exactly one click, no fumbling between separate play buttons.
- **SC-004 (AI Feedback Quality)**: AI shadowing feedback includes at least one timing observation and one phoneme-specific correction per submission.
- **SC-005 (Session Flow)**: A complete shadow cycle (listen → record → compare → feedback) completes within 60 seconds of user effort.

---

## Assumptions & Boundaries

- Reference audio for MVP uses Web Speech Synthesis API (browser TTS). Pre-recorded native speaker audio is a post-MVP enhancement.
- Waveform visualization is amplitude-based (not spectrogram/pitch contour) for MVP simplicity.
- Audio is NOT uploaded to any external server; all processing is local or via the local backend.
- Synced scrubbing (FR-007) is a stretch goal — basic stacked waveforms without scrubbing is acceptable for MVP.
- This feature builds on the same `MediaRecorder` infrastructure as `002-pronunciation-scorer`; shared audio utilities should be extracted.
- Compatible with Chromium-based browsers (Edge/Chrome) on Windows 11.
