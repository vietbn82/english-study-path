# Feature Specification: Vietnamese Mouth-Map Comparison

**Feature Branch**: `006-vietnamese-mouth-map`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "For every English phoneme, show a side-by-side: Vietnamese speakers do THIS → English requires THIS. Animated SVG of tongue/lip position — left panel shows the Vietnamese habit (e.g., unreleased /t/), right panel shows the English target. Makes the specific fix obvious, not generic."

---

## User Scenarios & Testing

### User Story 1 - Side-by-Side Mouth Diagram (Vietnamese vs English) (Priority: P1)

As a Vietnamese developer who unconsciously applies Vietnamese phonological habits when speaking English, I want to see a clear side-by-side visual showing "what my mouth does now (Vietnamese)" vs "what it needs to do (English)" for each target phoneme, so that I understand the *specific physical change* required rather than guessing.

**Why this priority**: The constitution mandates kinesthetic articulatory primacy. A side-by-side contrastive diagram is the most direct way to show a Vietnamese speaker exactly what to change.

**Independent Test**: Open Day 1 lesson (target: `/t/` vs `/d/` endings), verify a side-by-side diagram shows: Left="Vietnamese: tongue tip touches alveolar ridge, NO air release (unreleased)" → Right="English: tongue tip taps alveolar ridge, sharp air BURST release."

**Acceptance Scenarios**:

1. **Given** today's lesson targets the phoneme `/t/` ending, **When** the Phonetics block loads, **Then** a side-by-side panel renders with: Left card labeled "🇻🇳 Your Vietnamese Habit" showing an SVG cross-section of unreleased `/t/` (tongue touching, closed airflow arrow), Right card labeled "🇬🇧 English Target" showing released `/t/` (tongue tapping, open airflow arrow with burst indicator).
2. **Given** the phoneme is `/θ/` (as in `method`), **When** the diagram loads, **Then** Left shows "🇻🇳 Vietnamese: tongue behind teeth, /t/ sound" and Right shows "🇬🇧 English: tongue tip between teeth, air flowing over tongue surface (fricative)."
3. **Given** the phoneme has no Vietnamese equivalent (e.g., `/ʒ/`), **When** the diagram loads, **Then** Left shows "🇻🇳 No equivalent — Vietnamese has no /ʒ/ sound" with the closest Vietnamese approximation noted, and Right shows the English target.

---

### User Story 2 - Common Mistake Callout per Phoneme (Priority: P2)

As a learner, I want each contrastive diagram to include a prominent "⚠️ Common Mistake" callout explaining the specific error Vietnamese speakers make with this phoneme, written in plain Vietnamese + English, so that I recognize my own error pattern.

**Why this priority**: Abstract diagrams without context leave learners unsure if the issue applies to them. Naming the specific Vietnamese interference pattern creates an "aha moment."

**Independent Test**: On the `/s/` vs `/z/` lesson, verify a callout reads: "⚠️ Lỗi phổ biến: Vietnamese speakers say /s/ for both — English requires vocal cord vibration for /z/ (buzz vs hiss)."

**Acceptance Scenarios**:

1. **Given** the target phoneme pair is `/s/` vs `/z/`, **When** the diagram loads, **Then** a callout box shows: "⚠️ **Lỗi phổ biến (Common Mistake):** Tiếng Việt không phân biệt /s/ và /z/. Bạn thường nói 'ree-zon' thành 'ree-son'. → Đặt tay lên cổ họng: /z/ phải rung, /s/ không rung."
2. **Given** the target is consonant clusters (e.g., `scripts` /skrɪpts/), **When** the callout renders, **Then** it shows: "⚠️ **Lỗi phổ biến:** Người Việt hay chèn nguyên âm: 'sờ-kờ-ríp' → Phải nối liền: sk-r-ɪ-pts, không chèn âm nào."

---

### User Story 3 - Animated Transition (Vietnamese → English) (Priority: P3)

As a kinesthetic learner, I want to see an animated SVG that smoothly transitions from the Vietnamese mouth position to the English target position, so that I can visualize the physical movement my tongue/lips need to make.

**Why this priority**: Static diagrams show two states; animation shows the *journey* between them, which is what the learner's muscles need to execute.

**Independent Test**: On the `/θ/` phoneme, click "▶️ Show Movement", verify an SVG animation plays showing the tongue sliding from behind-teeth position to between-teeth position over 2 seconds.

**Acceptance Scenarios**:

1. **Given** the side-by-side diagram is displayed for `/θ/`, **When** the user clicks "▶️ Xem chuyển động (Show Movement)", **Then** a single SVG panel animates: tongue starts at Vietnamese /t/ position (behind teeth) and smoothly moves to English /θ/ position (between teeth) over 1.5-2 seconds, with the airflow path updating.
2. **Given** the animation has played, **When** the user clicks "🔄 Replay", **Then** the animation replays from the start.
3. **Given** the phoneme involves lip shape change (e.g., `/ʃ/` requiring rounded lips), **When** the animation plays, **Then** the lip outline morphs from neutral to rounded position.

---

### Edge Cases

- What about phonemes that are similar in Vietnamese and English (e.g., `/m/`, `/n/`)? → Show a "✅ Similar" panel: "Good news — this sound works the same in Vietnamese! Focus on using it in consonant clusters."
- How are vowel comparisons handled? → Same side-by-side format with jaw opening, tongue height, and lip rounding differences.
- What if SVG animations are too complex for the initial build? → Fall back to static diagrams with numbered steps ("Step 1: Move tongue forward. Step 2: Push tip between teeth.").
- Are diagrams reusable across lessons? → Yes, each phoneme has one canonical diagram; lessons reference them by phoneme ID.

## Requirements

### Functional Requirements

- **FR-001 (Contrastive Diagram Data)**: System MUST store contrastive phoneme data for all target phonemes in the 90-day curriculum, including: Vietnamese default position, English target position, articulatory difference description, and common mistake text (bilingual).
- **FR-002 (Side-by-Side Rendering)**: System MUST render two-panel SVG diagrams: left (Vietnamese habit) and right (English target), each showing a sagittal cross-section of the vocal tract with labeled articulators.
- **FR-003 (Common Mistake Callouts)**: Each phoneme comparison MUST include a bilingual (Vietnamese + English) callout describing the specific interference pattern.
- **FR-004 (SVG Mouth Diagrams)**: Diagrams MUST be implemented as inline SVG with distinct visual elements for: tongue (tip, blade, dorsum), teeth (upper, lower), alveolar ridge, hard palate, soft palate (velum), lips, airflow direction arrows, and vocal cord vibration indicator.
- **FR-005 (Animation)**: System SHOULD support CSS/SMIL animated SVG transitions from Vietnamese to English mouth position (stretch goal; static diagrams are MVP).
- **FR-006 (Curriculum Integration)**: Contrastive diagrams MUST be embedded in the existing daily lesson view within the Phonetics block, replacing or augmenting the current text-based articulatory descriptions.
- **FR-007 (Phoneme Library)**: All diagrams MUST be stored as reusable components indexed by IPA symbol, referenced by lessons via `TargetPhonemes` field.

### Key Entities

- **PhonemeContrastMap**: `IpaSymbol`, `VietnameseHabit` (object: `TonguePosition`, `LipShape`, `AirflowType`, `VoicingStatus`, `Description_Vi`, `Description_En`), `EnglishTarget` (same structure), `CommonMistake_Vi`, `CommonMistake_En`, `SvgDiagramId`, `AnimationAvailable`.
- **MouthDiagram**: `DiagramId`, `SvgMarkup` (inline SVG string), `Articulators[]` (labeled parts), `AnimationKeyframes[]` (optional).

Extends existing entities:
- **Lesson** (extend): `PhonemeContrasts[]` referencing `PhonemeContrastMap` entries by IPA symbol.

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Diagram Coverage)**: 100% of target phonemes in the 90-day curriculum have a contrastive Vietnamese→English diagram.
- **SC-002 (Render Performance)**: SVG diagrams render in <300ms, no layout shift.
- **SC-003 (Bilingual Callout Coverage)**: Every phoneme has both Vietnamese and English mistake descriptions.
- **SC-004 (Learner Comprehension)**: Diagrams are understandable without prior linguistics knowledge (validated by user testing with the target learner).

---

## Assumptions & Boundaries

- SVG diagrams are hand-crafted or generated from a template; no external diagram library dependency.
- The sagittal cross-section style follows standard phonetics textbook conventions (simplified for non-linguists).
- Animation (US3) is a stretch goal; static side-by-side diagrams are the MVP.
- Contrastive data is authored as a JSON data file in `wwwroot/data/` or `Data/`, consumed by both backend and frontend.
- Initial phoneme set covers the curriculum's ~20 target phonemes; not all 44 English phonemes.
- Vietnamese descriptions use informal, developer-friendly language, not academic linguistics terminology.
