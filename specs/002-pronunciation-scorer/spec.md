# Feature Specification: Speech-to-Text Pronunciation Scorer

**Feature Branch**: `002-pronunciation-scorer`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Integrate browser SpeechRecognition API or local Whisper. Compare user's spoken output against target phonemes and highlight mispronounced endings (/t/, /s/, /θ/). Score accuracy per drill."

---

## User Scenarios & Testing

### User Story 1 - Real-Time Mic Recording & Transcription (Priority: P1)

As a learner doing my daily 10-minute AI Output drill, I want to click a "Record" button next to any vocabulary word or sentence frame, speak into my microphone, and see my speech transcribed in real-time so that I can immediately see what the system heard versus what I intended to say.

**Why this priority**: Without reliable capture and transcription, no scoring or feedback is possible. This is the foundational input pipeline.

**Independent Test**: Open Day 1 lesson, click Record on the word `test`, say "test", verify the transcription appears within 2 seconds showing the recognized text.

**Acceptance Scenarios**:

1. **Given** the user is on a lesson page with a vocabulary word `commit`, **When** they click the 🎤 Record button and say "commit", **Then** the browser captures audio via MediaRecorder, sends it to the transcription engine, and displays the recognized text within 2 seconds.
2. **Given** the user's browser does not support SpeechRecognition API, **When** the page loads, **Then** the system falls back to server-side Whisper transcription via `/api/speech/transcribe` endpoint.
3. **Given** the user has not granted microphone permission, **When** they click Record, **Then** a clear prompt explains how to enable mic access with no cryptic errors.

---

### User Story 2 - Phoneme-Level Comparison & Mispronunciation Highlighting (Priority: P2)

As a learner with Vietnamese phonological interference, I want the system to compare my spoken output against the target phonemes for each word and visually highlight which sounds I mispronounced (especially ending consonants like `/t/`, `/d/`, `/s/`, `/z/`, `/θ/`, `/ð/`) so that I know exactly which articulatory mechanic to fix.

**Why this priority**: The core differentiator — generic transcription apps don't highlight phoneme-level errors tailored to Vietnamese speakers.

**Independent Test**: Say the word "method" as "me-tốt" (common Vietnamese interference), verify the system highlights the `/θ/` as missed and the `/d/` ending as swallowed, with a kinesthetic correction tip.

**Acceptance Scenarios**:

1. **Given** the target word is `method` with expected phonemes `/ˈmɛθ.əd/`, **When** the user's transcription is interpreted as "me tot", **Then** the UI highlights `/θ/` in red with tooltip "Tongue between teeth — fricative, not stop" and `/d/` ending in orange with tooltip "Release the /d/ — tongue tip taps alveolar ridge".
2. **Given** the target sentence frame is "Yesterday, I focused on the deployment", **When** the user drops the `/t/` ending on "focused" and "deployment", **Then** each dropped ending is flagged with the specific articulatory correction from the curriculum.
3. **Given** the user pronounces a word correctly, **When** all target phonemes match, **Then** the word is highlighted in green with a ✅ indicator.

---

### User Story 3 - Per-Drill Accuracy Scoring & Progress Tracking (Priority: P3)

As a learner tracking my 90-day progress, I want each drill session to produce a 0–100 accuracy score broken down by phoneme category, and have those scores stored in my progress history so that I can see improvement trends over time.

**Why this priority**: Quantified feedback closes the improvement loop and motivates continued practice.

**Independent Test**: Complete a 10-word pronunciation drill, verify a score summary appears showing overall accuracy and per-phoneme-category breakdown, and verify the score is persisted in `progress.json`.

**Acceptance Scenarios**:

1. **Given** the user completes a drill with 10 target words, **When** results are submitted, **Then** the system calculates: overall accuracy (0-100), per-category scores (Ending Consonants, Fricatives, Clusters, Vowels), and displays a summary card.
2. **Given** pronunciation scores exist for Days 1-7, **When** the user views the progress dashboard, **Then** a trend line shows accuracy improvement per phoneme category over time.
3. **Given** a word scores below 60% accuracy, **When** the drill completes, **Then** the word is auto-enrolled into the SRS system as a weak spot via the existing `/api/srs/enroll` endpoint.

---

### Edge Cases

- What happens when background noise is too high? → Show a noise-level indicator and warn the user.
- What if the user speaks in Vietnamese accidentally? → Detect language mismatch and prompt: "It seems you spoke in Vietnamese. Try again in English."
- How does the system handle silence / no speech detected? → Timeout after 10 seconds with "No speech detected. Tap to try again."
- What about words with multiple valid pronunciations (e.g., British vs American)? → Accept both; default to American English per curriculum.

## Requirements

### Functional Requirements

- **FR-001 (Audio Capture)**: System MUST capture microphone audio via browser MediaRecorder API with WAV or WebM format.
- **FR-002 (Transcription Engine)**: System MUST transcribe speech using browser SpeechRecognition API (primary) with server-side fallback via `/api/speech/transcribe`.
- **FR-003 (Phoneme Comparison)**: System MUST compare transcribed output against target phonemes stored in the curriculum's `TargetPhonemes` field for each lesson.
- **FR-004 (Vietnamese Interference Detection)**: System MUST specifically detect and flag the top Vietnamese phonological interference patterns: dropped ending consonants, `/θ/`→`/t/` substitution, `/ʃ/`→`/s/` substitution, missing consonant clusters.
- **FR-005 (Visual Highlighting)**: System MUST color-code phoneme matches (green=correct, orange=partial, red=missed) with kinesthetic correction tooltips sourced from the curriculum's articulatory mechanics.
- **FR-006 (Accuracy Scoring)**: System MUST calculate a 0–100 accuracy score per word and per drill session, broken down by phoneme category.
- **FR-007 (Score Persistence)**: System MUST persist drill scores via a new `/api/speech/scores` endpoint, stored alongside existing progress data.
- **FR-008 (SRS Auto-Enroll)**: System MUST auto-enroll words scoring below 60% into the SRS weak-spot queue via existing `ISrsService.AutoEnrollWeakSpot`.
- **FR-009 (Server-Side Fallback)**: Backend MUST expose `/api/speech/transcribe` accepting audio blob and returning transcription + confidence scores for browsers without SpeechRecognition support.

### Key Entities

- **SpeechAttempt**: `AttemptId`, `DayNumber`, `TargetText`, `TargetPhonemes`, `TranscribedText`, `PhonemeResults[]`, `OverallScore`, `CreatedAt`.
- **PhonemeResult**: `TargetPhoneme`, `DetectedPhoneme`, `IsCorrect`, `Category` (EndingConsonant/Fricative/Cluster/Vowel), `CorrectionTip`.
- **DrillScore**: `DayNumber`, `SessionDate`, `WordCount`, `OverallAccuracy`, `CategoryScores{}`, `WeakSpots[]`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Transcription Latency)**: Speech-to-text result appears within 2 seconds of user finishing speaking.
- **SC-002 (Phoneme Detection Accuracy)**: System correctly identifies ≥80% of dropped ending consonants and fricative substitutions in controlled tests.
- **SC-003 (Score Consistency)**: Repeated pronunciation of the same word with the same quality produces scores within ±10 points.
- **SC-004 (SRS Integration)**: 100% of words scoring <60% are auto-enrolled in SRS within the same session.

---

## Assumptions & Boundaries

- User has a functional microphone connected to their Windows 11 machine.
- Browser is Chromium-based (Edge/Chrome) for best SpeechRecognition API support.
- Phoneme-level comparison uses AI-assisted analysis (via existing `IAiCoachService`) rather than a dedicated phoneme alignment library, keeping dependencies minimal.
- Server-side Whisper integration is a stretch goal; browser SpeechRecognition is the primary path.
- Audio files are NOT persisted long-term; only transcription results and scores are stored.
