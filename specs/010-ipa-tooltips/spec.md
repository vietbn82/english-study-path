# Feature Specification: Contextual Tooltips on IPA Symbols

**Feature Branch**: `010-ipa-tooltips`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Every IPA symbol (/θ/, /ʃ/, /ə/) in the UI is meaningless to a non-linguist. Add hover tooltips: /θ/ → 'TH sound like think — tongue between teeth.' Make IPA approachable instead of intimidating."

---

## User Scenarios & Testing

### User Story 1 - Hover Tooltip on IPA Symbols in Vocabulary Drills (Priority: P1)

As a Vietnamese developer with zero linguistics background, I want to hover over any IPA symbol (like `/θ/` or `/ʃ/`) in the vocabulary drill list and see a plain-language tooltip explaining the sound in Vietnamese + English with a one-line mouth instruction, so that I don't feel lost every time I see phonetic notation.

**Why this priority**: IPA symbols appear in every single lesson, every drill word, and every sentence frame. If the learner can't decode them, the entire phonetics block feels like a foreign script — which causes avoidance.

**Independent Test**: Hover over `/kəˈmɪt/` next to the word "commit" in Day 1's drill list, verify a tooltip appears within 200ms showing breakdown of each symbol with plain-language descriptions.

**Acceptance Scenarios**:

1. **Given** the word "commit" displays `/kəˈmɪt/` in the drill list, **When** the user hovers over the IPA text, **Then** a tooltip popup appears with: `/k/` = "K sound — back of tongue hits soft palate", `/ə/` = "Schwa — relax mouth completely, lazy 'uh'", `/ˈ/` = "Stress mark — emphasize next syllable", `/m/` = "M — close lips, hum through nose", `/ɪ/` = "Short I — like 'bit', jaw drops slightly", `/t/` = "T — tongue tip taps ridge behind teeth, burst of air".
2. **Given** the tooltip is displayed, **When** the user clicks the 🔊 icon inside the tooltip, **Then** the individual phoneme sound plays via TTS.
3. **Given** the user moves the mouse away from the IPA text, **When** the cursor leaves, **Then** the tooltip fades out after 300ms.

---

### User Story 2 - Inline IPA Tooltips in Contrastive Pairs and Sentence Frames (Priority: P2)

As a learner viewing the contrastive minimal pairs section (e.g., `/t/` vs `/d/`) or sentence frames with IPA annotations, I want the same tooltip behavior available everywhere IPA symbols appear across the entire app, so that the experience is consistent.

**Why this priority**: IPA appears in contrastive pairs, sentence frames, the Fundamentals page, and AI feedback. Inconsistent tooltip coverage creates confusion.

**Independent Test**: Hover over `/θ/` in the contrastive pairs section on Day 7, verify the same tooltip style appears with the Vietnamese mouth-map description.

**Acceptance Scenarios**:

1. **Given** the contrastive pair shows `/θ/` vs `/ð/`, **When** the user hovers over `/θ/`, **Then** the tooltip shows: "Voiceless TH — Đầu lưỡi kẹp giữa 2 hàm răng, đẩy hơi qua khe răng-lưỡi, KHÔNG rung cổ. Ví dụ: think, method, auth."
2. **Given** a sentence frame shows "Yesterday, I focused /ˈfoʊ.kəst/ on...", **When** the user hovers over the IPA, **Then** the tooltip explains the consonant cluster `/st/` ending.
3. **Given** the AI Coach feedback mentions a phoneme (e.g., "Watch your `/ð/` in 'this'"), **When** the user hovers over `/ð/` in the feedback text, **Then** the tooltip activates with the same data.

---

### User Story 3 - Vietnamese-First Explanations with Physical Cue (Priority: P1)

As a Vietnamese speaker, I want every IPA tooltip to include: (1) the closest Vietnamese sound equivalent (or "không có trong tiếng Việt" if none), (2) a one-line physical mouth instruction in Vietnamese, and (3) 2 example IT words, so that I understand through my native language, not English linguistics jargon.

**Why this priority**: Equal to US1 because the tooltip content determines whether it's actually useful. English-only linguistics explanations ("voiceless alveolar fricative") are useless to this learner.

**Independent Test**: Hover over `/ʃ/`, verify the tooltip reads in Vietnamese: "Gần giống âm 'S' tiếng Việt nhưng môi chu tròn hơn. Cơ chế: Chu môi về phía trước, thân lưỡi áp răng hàm trên, đẩy hơi. Ví dụ: push, cache."

**Acceptance Scenarios**:

1. **Given** the user hovers over `/ʃ/`, **When** the tooltip renders, **Then** it contains: Vietnamese equivalent: "Gần giống 'S' nhưng môi chu tròn", Physical cue: "Chu môi về phía trước như huýt sáo, thân lưỡi áp vào răng hàm trên", Examples: "push, cache, branch".
2. **Given** the phoneme `/θ/` has no Vietnamese equivalent, **When** the tooltip renders, **Then** it shows: "⚠️ Không có trong tiếng Việt! Người Việt thường đọc thành /t/ hoặc /s/. Cơ chế: Thè lưỡi ra giữa 2 hàm răng 2-3mm."
3. **Given** the schwa `/ə/`, **When** the tooltip renders, **Then** it shows: "Giống âm 'ơ' nhẹ trong tiếng Việt. Thả lỏng toàn bộ cơ miệng, không gắng sức."

---

### Edge Cases

- What about composite IPA strings like `/kəˈmɪt/`? → Break into individual symbols, each with its own tooltip segment displayed in a vertical list.
- What if the user is on touch screen (no hover)? → Tap on IPA text to show tooltip, tap elsewhere to dismiss.
- What about IPA symbols in dynamically loaded AI feedback? → Use event delegation so tooltips work on any `.ipa-symbol` element, including dynamically added content.
- How to handle very long IPA strings (full sentences)? → Only show tooltip for individual words' IPA, not sentence-level transcriptions.

## Requirements

### Functional Requirements

- **FR-001 (IPA Symbol Detection)**: System MUST identify all IPA notation in the UI (text matching pattern `/.../` or elements with class `.ipa-symbol`) and make them tooltip-interactive.
- **FR-002 (Tooltip Content)**: Each IPA phoneme tooltip MUST contain: (a) Phoneme symbol, (b) English name, (c) Vietnamese equivalent or "Không có", (d) One-line physical mouth instruction in Vietnamese, (e) 2 example IT words.
- **FR-003 (Phoneme Database)**: System MUST maintain a client-side lookup table of ~44 English phonemes with Vietnamese descriptions, sourced from the curriculum's `PhoneticsGuide` data.
- **FR-004 (Hover Trigger)**: Tooltip MUST appear within 200ms of hover start and fade out 300ms after hover end. No flicker on rapid mouse movement.
- **FR-005 (Touch Support)**: On touch devices, tooltips MUST activate on tap and dismiss on tap-outside.
- **FR-006 (Audio Playback)**: Each tooltip SHOULD include a 🔊 button to hear the individual phoneme via Web Speech Synthesis API.
- **FR-007 (Global Coverage)**: Tooltips MUST work on all pages and sections: drill list, contrastive pairs, sentence frames, AI feedback, Fundamentals page, and any dynamically rendered IPA text.
- **FR-008 (Event Delegation)**: Implementation MUST use event delegation on a parent container so tooltips work on dynamically inserted DOM elements without re-binding.
- **FR-009 (Non-Intrusive)**: Tooltip MUST NOT block underlying UI interactions. Position above/below the IPA text based on available viewport space (same logic as selection lookup popup).

### Key Entities

- **PhonemeTooltipEntry**: `IpaSymbol`, `EnglishName`, `VietnameseEquivalent`, `PhysicalCueVi`, `ExampleWords[]`, `Category` (Consonant/Vowel/Diphthong/Suprasegmental), `HasVietnameseEquivalent` (bool).
- **IpaTooltipDatabase**: Client-side JSON map of `IpaSymbol → PhonemeTooltipEntry`, loaded once and cached.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Coverage)**: 100% of IPA phonemes used in the 90-day curriculum have tooltip entries.
- **SC-002 (Tooltip Speed)**: Tooltip appears within 200ms of hover, verified by performance testing.
- **SC-003 (Vietnamese Content)**: Every tooltip contains Vietnamese-language explanation, not just English linguistics terms.
- **SC-004 (Comprehension)**: A non-linguist can understand the tooltip on first read (validated by user test with the target learner).

---

## Assumptions & Boundaries

- The phoneme database covers ~44 standard English phonemes + suprasegmental marks (stress `/ˈ/`, length `/ː/`).
- Tooltip UI reuses the same visual style as the existing selection-lookup popup (`.selection-lookup-popup` CSS class), keeping visual consistency.
- No external tooltip library; implemented as a single reusable JS module with CSS positioning.
- Tooltip data is embedded client-side in a JS constant or loaded from a small JSON file in `wwwroot/data/`.
- This feature is purely frontend; no new backend endpoints needed.
