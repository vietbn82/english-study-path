# Feature Specification: Cheat Sheet per Sprint (Printable One-Pager)

**Feature Branch**: `008-sprint-cheat-sheet`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Generate a single-page PDF per sprint: all 10 sentence frames, all target phonemes with mouth diagrams, all vocabulary. The user can print it, stick it on their monitor, and glance at it during actual standups. Bridges the gap between study app and real work."

---

## User Scenarios & Testing

### User Story 1 - Generate Sprint Summary Cheat Sheet (Priority: P1)

As a learner who completed Sprint 1 (Days 1-30), I want to generate a clean, printable one-page summary of everything I learned — all sentence frames, target phonemes, and key vocabulary — so that I can print it out and tape it next to my monitor for real standup/demo use.

**Why this priority**: The bridge between "study app" and "real work" is the highest-value outcome. If the learner can glance at a cheat sheet during an actual standup, the app delivers real-world impact immediately.

**Independent Test**: Click "📋 Generate Cheat Sheet" for Sprint 1, verify a well-formatted HTML page renders with all Sprint 1 content, optimized for A4 print, and the browser Print dialog opens cleanly.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Sprint 1 overview, **When** they click "📋 Print Cheat Sheet", **Then** a new page/modal opens with a print-optimized layout containing: all sentence frames from Days 1-30, target phoneme table with IPA + brief mouth position notes, and key IT vocabulary with pronunciation.
2. **Given** the cheat sheet is displayed, **When** the user triggers browser Print (Ctrl+P), **Then** the page renders cleanly on A4 paper (portrait) with proper margins, no cut-off content, no browser chrome, and readable font sizes (≥10pt).
3. **Given** Sprint 2 is in progress (user on Day 45), **When** the user requests Sprint 2 cheat sheet, **Then** only Days 31-60 content is included, even if some days are not yet completed.

---

### User Story 2 - Structured Layout with Sections (Priority: P2)

As a learner glancing at the cheat sheet during a real meeting, I want the content organized into clear scannable sections (Sentence Frames, Phoneme Quick Reference, Vocabulary) with visual hierarchy, so that I can find the right frame in under 3 seconds.

**Why this priority**: A wall of text is useless during a live standup. Scannable sections with bold headers and minimal text make it a functional reference tool.

**Independent Test**: Print the Sprint 1 cheat sheet, time how long it takes to locate the "Blocker" sentence frame — should be <3 seconds with clear section headers.

**Acceptance Scenarios**:

1. **Given** the cheat sheet renders, **When** displayed, **Then** it has 3 distinct sections with clear headers: "📝 Sentence Frames" (numbered list), "🦷 Phoneme Quick Ref" (table: IPA | Mouth Position | Example Word), "📚 Key Vocabulary" (2-column list: Word | /IPA/).
2. **Given** Sprint 1 has 8 sentence frames, **When** the Frames section renders, **Then** each frame is numbered, shows the template with blanks highlighted in bold/underline, and is grouped by context (Yesterday / Today / Blockers).
3. **Given** the Phoneme section has 10 target sounds, **When** it renders, **Then** each row shows: IPA symbol, one-line mouth instruction (e.g., "Tongue tip between teeth, push air"), and 2 example IT words.

---

### User Story 3 - Digital Quick-Access Version (Priority: P3)

As a learner in a remote meeting who can't have paper, I want a persistent digital cheat sheet accessible from the dashboard's top nav or system tray, so that I can Alt-Tab to it during a call.

**Why this priority**: Not everyone prints. A lightweight digital version always available complements the printable one.

**Independent Test**: During any lesson, click the "📋 Cheat Sheet" icon in the nav bar, verify a compact sidebar or popup shows the current sprint's frames and phonemes.

**Acceptance Scenarios**:

1. **Given** the user is on any page (lesson, analytics, fundamentals), **When** they click the "📋" icon in the top navigation bar, **Then** a sidebar panel opens showing the current sprint's cheat sheet content in a compact, scrollable format.
2. **Given** the sidebar is open, **When** the user clicks a sentence frame, **Then** it copies the frame to clipboard with a "Copied! ✅" toast — ready to paste into Slack/Teams with minor edits.

---

### Edge Cases

- What if a sprint has more content than fits on one A4 page? → Prioritize sentence frames (always page 1), overflow phonemes/vocabulary to page 2 if needed. Never exceed 2 pages.
- What about Sprint 3 which covers multiple conversation types? → Group frames by context: "1-on-1", "Tech Debate", "Small Talk" with sub-headers.
- Can the user customize which items appear on the cheat sheet? → Not in MVP. All sprint content is included.
- What about dark mode for the digital version? → Digital sidebar respects the app's current theme.

## Requirements

### Functional Requirements

- **FR-001 (Sprint Aggregation)**: System MUST aggregate all sentence frames, target phonemes, and key vocabulary for a given sprint (Days 1-30, 31-60, 61-90) from the curriculum data.
- **FR-002 (Print-Optimized HTML)**: System MUST generate a print-optimized HTML page with `@media print` CSS rules: A4 dimensions, proper margins (15mm), no background images that waste ink, high-contrast black text.
- **FR-003 (Section Layout)**: Cheat sheet MUST have 3 sections: Sentence Frames (grouped by context), Phoneme Quick Reference (table format), Key Vocabulary (compact 2-column list).
- **FR-004 (One-Page Target)**: Content MUST fit on 1 A4 page for Sprint 1 and Sprint 2. Sprint 3 may extend to 2 pages maximum.
- **FR-005 (API Endpoint)**: Backend MUST expose `/api/curriculum/cheatsheet/{sprintId}` returning aggregated cheat sheet data as JSON.
- **FR-006 (Digital Sidebar)**: A persistent "📋" icon in the app nav MUST open a sidebar panel showing the current sprint's cheat sheet.
- **FR-007 (Copy to Clipboard)**: Each sentence frame in the digital sidebar MUST support one-click copy to clipboard.
- **FR-008 (No External Dependencies)**: Cheat sheet rendering MUST use pure HTML/CSS — no PDF generation libraries. The browser's native print-to-PDF handles PDF creation.

### Key Entities

- **CheatSheet**: `SprintId`, `SprintTitle`, `SentenceFrames[]`, `PhonemeQuickRef[]`, `KeyVocabulary[]`.
- **CheatSheetFrame**: `FrameNumber`, `Context` (Yesterday/Today/Blockers/Demo/Debate), `Template` (with `___` blanks), `Example`.
- **CheatSheetPhoneme**: `IpaSymbol`, `MouthInstruction` (one-liner), `ExampleWords[]` (2 IT words).
- **CheatSheetVocab**: `Word`, `Ipa`, `SprintDay` (when first introduced).

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Print Quality)**: Cheat sheet prints cleanly on A4 via Ctrl+P in Chrome/Edge with zero cut-off content and readable fonts.
- **SC-002 (Scanability)**: Target sentence frame is locatable within 3 seconds of glancing at the printed sheet (validated by user test).
- **SC-003 (Content Accuracy)**: 100% of sentence frames and phonemes from the sprint are present on the cheat sheet (verified by comparing against curriculum data).
- **SC-004 (Copy Speed)**: One-click copy in digital sidebar copies the frame to clipboard in <200ms.

---

## Assumptions & Boundaries

- PDF generation is NOT required — browser print-to-PDF is the supported path.
- Cheat sheets are read-only aggregations of existing curriculum data; no new content authoring.
- The digital sidebar is a simple HTML panel, not a separate SPA route.
- Font choice for print: system monospace for IPA, system sans-serif for text.
- Cheat sheet content is always complete for the full sprint, regardless of learner's current progress within the sprint.
