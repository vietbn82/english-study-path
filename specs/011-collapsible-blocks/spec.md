# Feature Specification: Collapsible/Expandable Block Sections

**Feature Branch**: `011-collapsible-blocks`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "The 3 blocks always show full content, making the page very long. Add collapse/expand toggles per block. Auto-expand the current phase based on timer (0-10min: Phonetics open, 10-20min: Frames open, 20-30min: Output open). Reduces visual noise and focuses attention on the active block."

---

## User Scenarios & Testing

### User Story 1 - Manual Collapse/Expand per Block (Priority: P1)

As a learner looking at 3 dense content blocks side-by-side, I want to click a toggle button on each block header to collapse it to just the title bar and expand it back, so that I can focus on one block at a time without visual overwhelm.

**Why this priority**: The 3-column layout works on large screens but overwhelms on 1080p when all blocks are expanded. Manual collapse is the simplest de-cluttering mechanism.

**Independent Test**: Click the collapse toggle on the "Cơ Học Khẩu Hình (10m)" block header, verify the block content collapses to just the header bar. Click again to expand.

**Acceptance Scenarios**:

1. **Given** all 3 blocks are expanded (default state), **When** the user clicks the ▼ collapse toggle on Block 1 (Phonetics), **Then** Block 1's content area slides up/collapses to show only the header bar with the block title, number badge, and phonetic symbol — all drill words, SVG diagram, and instructions are hidden.
2. **Given** Block 1 is collapsed, **When** the user clicks the ▶ expand toggle, **Then** the block smoothly expands back to full content with a CSS transition (200ms ease-out).
3. **Given** the user collapses Block 1 and Block 2, **When** viewing the page, **Then** only Block 3 (AI Coach) is expanded — the page becomes visually clean with 2 slim header bars and 1 active block.
4. **Given** the user's collapse state, **When** they navigate to a different day via day switcher, **Then** the collapse/expand state persists (not reset on day change).

---

### User Story 2 - Auto-Expand Based on Timer Phase (Priority: P2)

As a learner using the 30-minute Pomodoro timer, I want the blocks to auto-expand based on the current timer phase (0-10min: Phonetics, 10-20min: Frames, 20-30min: Output), with the non-active blocks auto-collapsing, so that the UI guides my attention to the right block at the right time.

**Why this priority**: This transforms the 3-block layout from a static page into a guided workflow. The learner doesn't have to think about which block to focus on — the timer decides.

**Independent Test**: Start the 30-minute timer, verify Block 1 (Phonetics) is expanded and Blocks 2, 3 are collapsed. Wait until the timer crosses 10:00, verify Block 1 collapses and Block 2 (Frames) auto-expands.

**Acceptance Scenarios**:

1. **Given** the timer is started, **When** the timer is between 30:00 and 20:01 (first 10 minutes), **Then** Block 1 (Phonetics) is auto-expanded and Blocks 2, 3 are auto-collapsed, with Block 1's header showing a pulsing "▶ Đang học" indicator.
2. **Given** the timer crosses from 20:01 to 20:00, **When** the phase transitions from Phonetics to Frames, **Then** Block 1 smoothly collapses, Block 2 smoothly expands, and a subtle toast notification shows "📝 Phase 2: Sentence Frames — 10 minutes."
3. **Given** the timer crosses 10:00, **When** the phase transitions to Output, **Then** Block 2 collapses, Block 3 expands with the "▶ Đang học" indicator.
4. **Given** the timer-based auto-expand is active, **When** the user manually expands a different block, **Then** the auto-expand pauses for that block until the next phase transition (user override respected).

---

### User Story 3 - Expand-All / Collapse-All Toggle (Priority: P3)

As a learner who wants to see everything at once (e.g., reviewing before a real standup), I want a single "Expand All" / "Collapse All" button above the 3 blocks, so that I can quickly toggle the full view.

**Why this priority**: Power users sometimes want the overview. A global toggle prevents clicking 3 individual buttons.

**Independent Test**: Click "Collapse All", verify all 3 blocks collapse. Click "Expand All", verify all 3 expand.

**Acceptance Scenarios**:

1. **Given** all blocks are expanded, **When** the user clicks "▲ Thu gọn tất cả", **Then** all 3 blocks collapse simultaneously with a smooth transition.
2. **Given** all blocks are collapsed, **When** the user clicks "▼ Mở rộng tất cả", **Then** all 3 blocks expand simultaneously.
3. **Given** a mix of collapsed and expanded blocks, **When** the user clicks the global toggle, **Then** it acts as "Collapse All" if any block is expanded, or "Expand All" if all are collapsed.

---

### User Story 4 - Collapse State Persistence (Priority: P3)

As a learner who always collapses the Phonetics block on later sprints (when I've mastered basic sounds), I want my collapse preferences saved so they persist across page reloads, so that I don't have to re-collapse every session.

**Why this priority**: Reduces friction for returning learners who have developed a preferred layout.

**Independent Test**: Collapse Block 1, reload the page, verify Block 1 is still collapsed.

**Acceptance Scenarios**:

1. **Given** the user collapses Block 1 and Block 2, **When** the page is reloaded, **Then** the collapse state is restored from `localStorage`.
2. **Given** saved collapse state exists, **When** the user starts the timer (enabling auto-expand mode), **Then** auto-expand overrides saved state for the duration of the timer session. Saved state restores when timer is stopped/reset.

---

### Edge Cases

- What about mobile single-column layout? → Blocks stack vertically. Collapse behavior works the same but is even more valuable since scrolling is longer.
- What if the timer is paused? → Keep current block expanded, don't transition until timer resumes.
- What about the Session Complete section at the bottom of Block 3? → Always visible regardless of collapse state (it's the final action button).
- Do collapse transitions affect scroll position? → Auto-scroll to the newly expanded block's header to keep it in view.

## Requirements

### Functional Requirements

- **FR-001 (Collapse Toggle Button)**: Each block header MUST include a clickable collapse/expand toggle icon (▼ expanded / ▶ collapsed) positioned at the right side of the header bar.
- **FR-002 (Smooth Transition)**: Collapse/expand MUST animate with CSS transition (`max-height` or `height` with 200ms ease-out). No jarring show/hide jumps.
- **FR-003 (Header-Only Collapsed State)**: When collapsed, a block shows ONLY: block number badge, block title, phonetic symbol / context label, and the expand toggle — content area is hidden.
- **FR-004 (Timer-Linked Auto-Expand)**: When the 30-minute timer is running, blocks MUST auto-expand/collapse based on elapsed time: 0-10min → Block 1, 10-20min → Block 2, 20-30min → Block 3.
- **FR-005 (Active Block Indicator)**: The currently active (timer-linked) block MUST show a pulsing "▶ Đang học" badge in its header.
- **FR-006 (User Override)**: Manual collapse/expand by the user MUST override auto-expand for the current phase. Auto-expand resumes at the next phase transition.
- **FR-007 (Global Toggle)**: A "Thu gọn / Mở rộng tất cả" button MUST be placed above the 3-block grid.
- **FR-008 (State Persistence)**: Collapse state MUST be saved to `localStorage` with key `deveng-block-collapse-state` and restored on page load.
- **FR-009 (Auto-Scroll)**: When a block auto-expands (timer transition), the page MUST smooth-scroll to bring the expanded block's header into view.
- **FR-010 (Session Complete Visibility)**: The "Hoàn thành Ngày hôm nay" button section in Block 3 MUST remain visible even when Block 3 is collapsed (pinned at the bottom of the collapsed header).

### Key Entities

- **BlockCollapseState**: `block1Collapsed` (bool), `block2Collapsed` (bool), `block3Collapsed` (bool), `lastModified` (timestamp).
- **TimerPhase**: `phase` (1/2/3), `activeBlockIndex` (0/1/2), `startSeconds` (1800/1200/600), `endSeconds` (1201/601/0).

---

## Success Criteria

### Measurable Outcomes

- **SC-001 (Collapse Speed)**: Collapse/expand transition completes in <250ms with no layout shift or jank.
- **SC-002 (Timer Sync)**: Phase transitions trigger block swap within 1 second of crossing the time boundary.
- **SC-003 (State Persistence)**: Collapse state survives page reload 100% of the time (verified by integration test).
- **SC-004 (Reduced Visual Noise)**: When 2 of 3 blocks are collapsed, the visible page height decreases by ≥50% compared to all-expanded.

---

## Assumptions & Boundaries

- Implementation is pure frontend JS + CSS. No backend changes.
- CSS transition uses `max-height` with `overflow: hidden` for smooth animation (or CSS `details/summary` if sufficient).
- The existing 3-column grid layout (`lg:grid-cols-3`) is preserved. Collapsed blocks shrink vertically within their grid cell.
- On mobile (single column), collapsible blocks are especially valuable and work identically.
- Timer-linked auto-expand is opt-in: only activates when the timer is explicitly started, not on page load.
- The "Hoàn thành" button stays pinned because it's the most important CTA and must never be hidden behind a collapsed block.
