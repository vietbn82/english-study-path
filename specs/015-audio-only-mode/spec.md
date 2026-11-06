# Feature Specification: Audio-Only Mode (Eyes-Free)

**Feature Branch**: `015-audio-only-mode`  
**Created**: 2026-11-06  
**Status**: Draft  
**Input**: User description: "Add a mode where the app reads the lesson aloud: 'Hôm nay chúng ta luyện âm /θ/. Đặt lưỡi giữa hai hàm răng. Nghe mẫu: method. Bây giờ bạn nói.' The learner can close their eyes or lie down. Ideal for exhausted 22:00 sessions."

---

## User Scenarios & Testing

### User Story 1 - Start Audio-Only Session (Priority: P1)

As a developer who is exhausted at 22:00 and doesn't want to stare at a screen, I want to start an "Audio-Only" session where the app narrates the entire lesson in Vietnamese — instructions, phoneme demonstrations, drills, and sentence frames — so that I can practice with my eyes closed or while lying down.

**Why this priority**: Some nights, screen fatigue makes visual learning impossible. If the only options are "full visual session" or "skip entirely", the learner skips. Audio-only mode captures those otherwise-lost sessions.

**Independent Test**: Click "🎧 Chế độ Nghe" on the hero start screen, close eyes, verify the app narrates: lesson intro → phoneme instruction → plays target sounds → pauses for user to repeat → moves to sentence frames → pauses for user to speak → ends with summary.

**Acceptance Scenarios**:

1. **Given** the hero start screen is showing (spec 014), **When** the user clicks "🎧 Chế độ Nghe (Eyes-Free)", **Then** the screen dims to a minimal dark UI (just a large ⏸ Pause button and session progress indicator), and the app begins narrating the lesson via Web Speech Synthesis.
2. **Given** audio-only mode is active, **When** the narrator reaches a drill word (e.g., "method"), **Then** the sequence is: (a) Vietnamese instruction: "Từ tiếp theo: method — nghĩa là phương thức", (b) English TTS pronunciation at current speed setting, (c) 3-second pause with a soft chime: "Bây giờ bạn nói: method", (d) 3 more seconds of silence for the learner to speak, (e) move to next word.
3. **Given** audio-only mode reaches the Sentence Frames block, **When** a frame is narrated, **Then**: (a) Vietnamese context: "Khung câu báo cáo: Yesterday, I focused on...", (b) English TTS reads the full example, (c) 5-second pause: "Bây giờ bạn nói khung câu này với task thật của bạn", (d) 5 seconds silence.
4. **Given** the audio narration completes all 3 blocks, **When** the session ends, **Then** the narrator says: "Xong! Ngày [N] hoàn thành. Streak: [X] ngày. Nghỉ ngơi đi — mai gặp lại lúc 22:00." and the session is auto-marked as `Completed` (or `CompletedPartial` with `mode: AudioOnly`).

---

### User Story 2 - Pause, Resume, and Skip Controls (Priority: P1)

As a learner in audio-only mode, I want physical-friendly controls (large tap targets, voice-command-ready) to pause, resume, repeat the current item, or skip to the next block, so that I can control the flow without opening my eyes to find small buttons.

**Why this priority**: Equal to US1 because an audio session without controls is a podcast, not an interactive lesson. Pause/repeat is essential for practice.

**Independent Test**: During audio narration, tap anywhere on screen to pause. Tap again to resume. Double-tap to repeat the current word/frame. Swipe right to skip to next block.

**Acceptance Scenarios**:

1. **Given** audio-only mode is active, **When** the user taps anywhere on the screen, **Then** narration pauses immediately with a soft "bíp" confirmation tone. Tap again to resume.
2. **Given** narration is paused, **When** the user double-taps, **Then** the current item (word or frame) replays from the beginning.
3. **Given** the user is in the Phonetics block, **When** they swipe right (or click "⏭ Phần tiếp"), **Then** narration jumps to the Sentence Frames block.
4. **Given** the screen is dimmed in audio mode, **When** displayed, **Then** only 3 large controls are visible: ⏸ Pause (center, 80x80px), 🔄 Repeat (left, 60x60px), ⏭ Skip (right, 60x60px). All buttons have min touch target 48px.

---

### User Story 3 - Audio Script Generation from Lesson Data (Priority: P2)

As the system, I need to automatically generate a Vietnamese narration script from the existing lesson data (phonetics instructions, vocabulary drills, sentence frames) so that audio-only mode works for all 90 days without manual script authoring.

**Why this priority**: Manual scripting for 90 lessons is infeasible. Auto-generation from existing curriculum data ensures full coverage with zero content creation effort.

**Independent Test**: Load Day 7 (target: `/θ/` vs `/ð/`), trigger audio-only mode, verify the narration correctly reads Day 7's Vietnamese instructions, plays "auth" and "method" with English TTS, and uses the correct articulatory guidance from `mechanicalInstructions`.

**Acceptance Scenarios**:

1. **Given** Day 7's lesson data includes `mechanicalInstructions: "Đưa đầu lưỡi ra giữa 2 hàm răng..."`, **When** audio script generates, **Then** the narration includes this exact text read in Vietnamese TTS.
2. **Given** Day 7 has vocabulary `["auth", "method", "thread"]`, **When** the drill section narrates, **Then** each word is: (a) announced in Vietnamese: "Từ: auth, nghĩa là xác thực", (b) pronounced in English TTS, (c) followed by a practice pause.
3. **Given** a lesson has 2 sentence frames, **When** frames narrate, **Then** each frame's `templatePattern` is read in English TTS, followed by `vietnameseTranslation` in Vietnamese TTS, followed by a practice pause.

---

### User Story 4 - Minimal Visual UI During Audio Mode (Priority: P3)

As a learner who occasionally glances at the screen, I want the audio-only mode to show a minimal UI: current word/frame in very large text (32px+), a progress indicator (e.g., "Word 3/5"), and the 3 control buttons — nothing else, so that a quick glance provides context without full visual engagement.

**Why this priority**: Pure audio with zero visual is disorienting for some learners. A minimal heads-up display bridges audio-primary and visual-secondary.

**Independent Test**: In audio-only mode, glance at screen during a drill word, verify the word is displayed in large text (32px+) centered on a dark background.

**Acceptance Scenarios**:

1. **Given** the narrator is playing the word "method", **When** the user glances at the screen, **Then** the center of the screen shows: `method` in 32px white text, `/ˈmɛθ.əd/` in 20px cyan text below, "Từ 3/5 · Phonetics" at the top, and the 3 control buttons at the bottom.
2. **Given** the narrator is on sentence frames, **When** the user glances, **Then** the screen shows the full frame template in 18px text, centered.
3. **Given** the screen has been untouched for 30 seconds, **When** no interaction occurs, **Then** the screen dims further (OLED-friendly near-black) to save battery/reduce light.

---

### Edge Cases

- What if the device doesn't support Vietnamese TTS? → Fall back to reading Vietnamese text in English TTS accent (imperfect but functional). Show warning: "Vietnamese TTS unavailable — instructions will sound accented."
- What about SRS warm-up in audio mode? → Warm-up plays in audio mode too: narrate the word, pause for recall, user says "got it" or taps ✅/❌.
- Can the learner record their speech in audio mode? → Not in MVP. Audio mode is passive practice (listen + repeat aloud without recording). Recording integration is a post-MVP enhancement.
- What about the self-check prompts (spec 013)? → Narrate them in Vietnamese: "Đặt tay lên cổ họng — bạn có cảm nhận rung không? Bấm nếu đúng."
- What if the timer runs out before narration finishes? → Timer is advisory in audio mode. Narration continues until complete; session duration is logged as actual time.

## Requirements

### Functional Requirements

- **FR-001 (Audio Mode Entry)**: System MUST provide a "🎧 Chế độ Nghe" button on the hero start screen and in the workspace header to enter audio-only mode.
- **FR-002 (Narration Engine)**: System MUST generate narration by sequencing Web Speech Synthesis utterances (Vietnamese for instructions, English for target words/sentences) with timed pauses for practice.
- **FR-003 (Vietnamese TTS)**: Instructions, context, and prompts MUST be narrated using `SpeechSynthesisUtterance` with `lang: 'vi-VN'`. Fall back to `'en-US'` if Vietnamese voice is unavailable.
- **FR-004 (English TTS for Targets)**: All English vocabulary words, IPA examples, and sentence frames MUST be narrated with `lang: 'en-US'` at the user's selected speed (spec 012 integration).
- **FR-005 (Practice Pauses)**: System MUST insert configurable pauses: 3 seconds after drill words, 5 seconds after sentence frames, with a soft chime to signal "your turn".
- **FR-006 (Playback Controls)**: Audio mode MUST support: Tap to pause/resume, Double-tap to repeat current item, Swipe right or ⏭ button to skip to next block.
- **FR-007 (Large Touch Targets)**: All control buttons MUST be ≥48px minimum touch target, with ⏸ Pause at ≥80px.
- **FR-008 (Minimal Visual UI)**: During audio mode, screen MUST show only: current word/frame in large text, progress indicator, and control buttons on a near-black background.
- **FR-009 (Auto-Dim)**: Screen MUST dim to near-black after 30 seconds of no touch interaction.
- **FR-010 (Auto-Complete)**: When narration finishes all 3 blocks, session MUST be auto-marked as `Completed` with `mode: AudioOnly`.
- **FR-011 (Script Generation)**: Narration script MUST be auto-generated from existing `Lesson` data fields: `mechanicalInstructions`, `commonVietnameseMistake`, `vocabularyDrills`, `sentenceFrames`, `practiceTask`.
- **FR-012 (Session Tracking)**: Audio-only sessions MUST be tracked in progress data with a `SessionMode: AudioOnly` flag.

### Key Entities

- **AudioScript**: `DayNumber`, `Segments[]` — ordered list of `AudioSegment` objects.
- **AudioSegment**: `Type` (Instruction/DrillWord/SentenceFrame/Pause/SelfCheck/Summary), `TextVi` (Vietnamese narration text), `TextEn` (English target text), `PauseDurationMs`, `Lang` ('vi-VN' | 'en-US'), `SpeedMultiplier`.
- **AudioSessionState**: `isActive` (bool), `currentSegmentIndex`, `isPaused`, `startedAt`, `completedSegments`.

Extends existing entities:
- **SessionLog** (extend): Add `SessionMode` field ("Visual" | "AudioOnly" | "Mixed").

---

## Success Criteria

- **SC-001 (Zero-Screen Usability)**: A learner can complete a full 30-minute audio session without looking at the screen (validated by user test with eyes closed).
- **SC-002 (Narration Coverage)**: 100% of lesson content (instructions, drills, frames, task) is narrated for all 90 days.
- **SC-003 (Control Responsiveness)**: Pause/resume responds within 200ms of tap.
- **SC-004 (Skip Prevention)**: Sessions that would have been skipped (late night, screen fatigue) are captured as AudioOnly sessions.

---

## Assumptions & Boundaries

- No server-side audio generation; all narration uses client-side Web Speech Synthesis API.
- Vietnamese TTS quality depends on the OS/browser's installed voices. Windows 11 includes "Microsoft An" (vi-VN).
- Audio-only mode does NOT record the learner's speech (no mic). It's a listen-and-repeat-aloud exercise.
- The chime/tone for practice pauses is a short system beep or a bundled small audio file in `wwwroot/audio/chime.mp3`.
- This feature is especially powerful combined with spec 005 (Micro-Lesson) — user can do a 10-minute audio-only micro-session.
- No voice command integration in MVP. Controls are tap/touch only.
