# Feature Specification: "Cảm Nhận Cơ Thể" Physical Self-Check Prompts

**Feature Branch**: `013-physical-self-check`  
**Created**: 2026-11-06  
**Status**: Draft  
**Input**: User description: "After each phoneme drill, prompt: 'Đặt tay lên cổ họng — bạn có cảm nhận rung không?' or 'Đặt tay trước miệng — có luồng hơi mạnh không?'. Turns abstract sounds into tactile verification a Vietnamese learner can do alone."

---

## User Scenarios & Testing

### User Story 1 - Tactile Self-Check Prompt After Each Phoneme Drill (Priority: P1)

As a Vietnamese learner practicing phonemes alone at 22:00 without a tutor, I want the app to prompt me with a specific physical self-check action after I practice each target sound (e.g., "Đặt tay lên cổ họng — bạn có cảm nhận rung không?"), so that I can verify correct articulation through touch instead of relying on my weak ears.

**Why this priority**: The constitution mandates kinesthetic primacy over auditory mimicry. Physical self-checks are the only way a solo learner with poor auditory perception can verify correct production without a tutor present.

**Independent Test**: Practice the word "build" (voiced `/d/` ending) on Day 1, verify the app shows: "✋ Kiểm tra: Đặt 2 ngón tay lên hõm cổ họng khi nói '/d/' cuối. Bạn phải cảm nhận RUNG nhẹ. Nếu không rung → bạn đang nói /t/ thay vì /d/."

**Acceptance Scenarios**:

1. **Given** the learner just practiced a voiced phoneme (`/d/`, `/z/`, `/ð/`, `/dʒ/`), **When** the drill word finishes (after 🔊 playback or 🎤 recording), **Then** a self-check card slides in below the word: "✋ **Kiểm tra voiced:** Đặt 2 ngón tay lên hõm cổ họng. Khi nói [word] — cuối từ phải RUNG. Không rung = sai."
2. **Given** the learner practiced a voiceless aspirated phoneme (`/t/`, `/p/`, `/k/`), **When** the drill finishes, **Then** the self-check shows: "✋ **Kiểm tra bật hơi:** Đặt lòng bàn tay trước miệng cách 5cm. Khi nói [word] — cuối từ phải có luồng GIÓ MẠNH phả vào tay. Không có gió = nuốt âm."
3. **Given** the learner practiced an interdental (`/θ/`, `/ð/`), **When** the drill finishes, **Then** the self-check shows: "✋ **Kiểm tra lưỡi:** Nhìn gương — đầu lưỡi phải THÈ RA giữa 2 hàm răng 2-3mm. Nếu lưỡi ở sau răng = bạn đang nói /t/ hoặc /s/."
4. **Given** the self-check card is displayed, **When** the user clicks "✅ Đã cảm nhận đúng" or "❌ Chưa đúng, thử lại", **Then** the response is logged and the next drill word loads.

---

### User Story 2 - Phoneme-Category Self-Check Library (Priority: P2)

As a learner, I want the self-check prompts to be specific to each phoneme category (stops, fricatives, affricates, nasals, vowels) with different physical tests for each, so that I'm not doing the same "touch throat" check for every sound.

**Why this priority**: A one-size-fits-all "touch your throat" prompt becomes meaningless after Day 3. Category-specific checks keep the tactile verification relevant and educational.

**Independent Test**: Practice `/ʃ/` (fricative) and verify the self-check is about lip shape, not throat vibration. Practice `/m/` (nasal) and verify the self-check is about nose vibration.

**Acceptance Scenarios**:

1. **Given** the phoneme is a fricative (`/s/`, `/z/`, `/ʃ/`, `/θ/`), **When** the self-check shows, **Then** it tests airflow: "Đặt ngón tay trước miệng — có cảm nhận luồng gió LIÊN TỤC không? (Không phải bật 1 lần như /t/)."
2. **Given** the phoneme is a nasal (`/m/`, `/n/`, `/ŋ/`), **When** the self-check shows, **Then** it tests nasal resonance: "Bịt mũi và nói — nếu KHÔNG nói được = đúng rồi, đó là âm mũi. Nếu vẫn nói bình thường = sai."
3. **Given** the phoneme is a vowel (`/iː/` vs `/ɪ/`), **When** the self-check shows, **Then** it tests jaw/muscle tension: "Đặt 2 ngón tay dưới cằm. /iː/ (sheep): cơ hàm CĂNG, mép cười bè. /ɪ/ (ship): cơ hàm CHÙNG, hàm rơi xuống 0.5cm."

---

### User Story 3 - Self-Check Dismissal & Frequency Control (Priority: P3)

As a learner on Day 45 who has mastered basic voiced/voiceless distinction, I want self-checks to appear less frequently for phonemes I've consistently gotten right, and I want the option to hide them entirely for mastered sounds, so that they don't slow me down.

**Why this priority**: Self-checks are invaluable for beginners but become annoying for intermediate learners. Adaptive frequency prevents feature fatigue.

**Independent Test**: After marking "✅ Đã cảm nhận đúng" 5 consecutive times for `/t/`, verify the self-check frequency drops from every word to every 3rd word.

**Acceptance Scenarios**:

1. **Given** the learner has answered "✅ Đã cảm nhận đúng" 5+ times consecutively for a phoneme category, **When** that category appears in a drill, **Then** the self-check shows only every 3rd word instead of every word.
2. **Given** the learner has answered correctly 10+ times for a category, **When** the self-check would appear, **Then** it's hidden entirely with a small "✋ Kiểm tra" link available if they want it back.
3. **Given** the learner clicks "Luôn hiện kiểm tra" in settings, **When** drills play, **Then** self-checks always appear regardless of mastery level.

---

### Edge Cases

- What if the phoneme doesn't have a clear physical self-check (e.g., schwa `/ə/`)? → Show a relaxation check: "Thả lỏng toàn bộ hàm và lưỡi. Nếu bạn đang gắng sức → bạn đang nói sai schwa."
- What about consonant clusters (e.g., `/skr/` in "scripts")? → Show a combined check: "Nói từng âm riêng: /s/...pause.../k/...pause.../r/... rồi nối nhanh dần."
- Do self-checks appear in Quick/Micro mode? → Yes, but only for the first 2 words (time-constrained).
- What about the Sentence Frames block? → Self-checks only appear in the Phonetics block (Block 1), not during sentence practice.

## Requirements

### Functional Requirements

- **FR-001 (Auto-Prompt)**: After each drill word practice (🔊 listen or 🎤 record), system MUST display a phoneme-appropriate physical self-check card.
- **FR-002 (Category-Specific Checks)**: System MUST maintain a library of self-check prompts for each phoneme category: Stops (bật hơi), Fricatives (luồng gió liên tục), Affricates (bật + xát), Nasals (bịt mũi), Interdentals (thè lưỡi gương), Vowels (căng/chùng cơ hàm).
- **FR-003 (Binary Feedback)**: Each self-check MUST present two buttons: "✅ Đã cảm nhận đúng" and "❌ Chưa đúng, thử lại".
- **FR-004 (Feedback Logging)**: Self-check responses MUST be logged per phoneme category to enable adaptive frequency (FR-005).
- **FR-005 (Adaptive Frequency)**: After 5 consecutive correct self-checks for a category, frequency MUST reduce to every 3rd word. After 10, auto-hide with manual re-enable option.
- **FR-006 (Vietnamese Language)**: All self-check prompts MUST be written in clear, informal Vietnamese with physical action instructions.
- **FR-007 (Visual Design)**: Self-check card MUST use a distinct visual style (amber/warm background, ✋ icon) to differentiate from lesson content.
- **FR-008 (Non-Blocking)**: Self-check cards MUST NOT block the drill flow. The learner can dismiss/skip without answering.

### Key Entities

- **SelfCheckPrompt**: `PhonemeCategory`, `CheckType` (Throat/Airflow/Tongue/Jaw/Nose), `InstructionVi`, `CorrectFeeling`, `IncorrectMeaning`, `PhonemeExamples[]`.
- **SelfCheckLog**: `DayNumber`, `PhonemeCategory`, `Word`, `WasCorrect` (bool), `Timestamp`.
- **SelfCheckFrequency**: `PhonemeCategory`, `ConsecutiveCorrect` (int), `ShowEveryNth` (1/3/never).

---

## Success Criteria

- **SC-001**: 100% of phoneme categories in the curriculum have at least one physical self-check prompt.
- **SC-002**: Self-check card appears within 200ms after drill word interaction.
- **SC-003**: Adaptive frequency correctly reduces after 5 and 10 consecutive correct answers (unit tested).
- **SC-004**: Prompts are understandable by a non-linguist Vietnamese speaker on first read.

---

## Assumptions & Boundaries

- Self-checks are frontend-only; responses stored in `localStorage` or appended to session data.
- Self-check prompt library is a static JSON dataset (~20 entries covering all target phoneme categories).
- No camera/mirror integration — the "nhìn gương" prompt is instructional, not verified by the app.
- Self-checks only appear in the Phonetics block (Block 1), not in Frames or Output blocks.
