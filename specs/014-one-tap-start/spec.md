# Feature Specification: "Bắt Đầu Ngay" One-Tap Start

**Feature Branch**: `014-one-tap-start`  
**Created**: 2026-11-06  
**Status**: Draft  
**Input**: User description: "Replace the current multi-element lesson page with a single giant button on load: '▶ Bắt Đầu Ngày 15 (30 phút)'. Tapping it starts the timer, auto-expands Block 1, and hides everything else. Zero decisions needed — just start."

---

## User Scenarios & Testing

### User Story 1 - Hero Start Screen on Page Load (Priority: P1)

As a tired developer opening the app at 22:00, I want to see a single, giant, unmissable "▶ Bắt Đầu Ngày 15" button instead of the full 3-column lesson layout, so that I can start my session with zero cognitive overhead — no scanning, no deciding, just one tap.

**Why this priority**: The #1 friction point at 22:00 is decision fatigue. The current UI presents 3 blocks, a timer, nav tabs, telemetry stats, and 10+ interactive elements simultaneously. The learner's first thought is "where do I start?" — and that hesitation causes skips.

**Independent Test**: Open the app at Day 15 (session not yet completed today), verify the workspace shows a centered hero card with "▶ Bắt Đầu Ngày 15 — 30 phút" button, streak count, and nothing else. Tap it, verify the full lesson UI appears with timer running and Block 1 expanded.

**Acceptance Scenarios**:

1. **Given** the user opens the app and today's session is not yet completed, **When** the workspace view loads, **Then** a hero overlay/card is displayed centered on screen with: Day number and title ("Ngày 15: Consonant Clusters & Schwa"), a large "▶ Bắt Đầu (30 phút)" button, current streak ("🔥 14 ngày liên tiếp"), and a "⚡ Quick 10min" alternative button (if spec 005 is implemented).
2. **Given** the hero start screen is showing, **When** the user clicks "▶ Bắt Đầu (30 phút)", **Then**: (a) the hero overlay disappears, (b) the full 3-block lesson UI reveals, (c) the 30-minute timer auto-starts, (d) Block 1 (Phonetics) auto-expands (if spec 011 is implemented), (e) SRS warm-up triggers first (if spec 007 is implemented).
3. **Given** the hero start screen is showing, **When** the user clicks "⚡ Quick 10min", **Then** the block selector appears (per spec 005) and the hero overlay dismisses.
4. **Given** today's session is already completed, **When** the workspace loads, **Then** the hero start screen is NOT shown. Instead, the completed session banner and full lesson content are visible for review.

---

### User Story 2 - Motivational Context on Start Screen (Priority: P2)

As a learner who needs a reason to start, I want the hero screen to show a brief motivational snippet — today's learning goal in one sentence and my streak — so that I feel pulled to start rather than pushed.

**Why this priority**: The start screen is the app's first impression every night. A blank "press start" is functional but not motivational. A streak reminder and goal preview create emotional pull.

**Independent Test**: On Day 15, verify the hero screen shows: "🎯 Hôm nay: Cụm phụ âm /skr/, /str/ — không chèn nguyên âm!" and "🔥 Streak: 14 ngày — đừng phá kỷ lục!"

**Acceptance Scenarios**:

1. **Given** today is Day 15 with a 14-day streak, **When** the hero screen renders, **Then** it shows: Sprint badge ("Sprint 1 · Ngày 15/30"), one-line objective ("Cụm phụ âm: scripts /skrɪpts/, fixed /fɪkst/"), streak motivator ("🔥 14 ngày liên tiếp — thêm 1 ngày nữa!"), and SRS count ("🧠 3 từ cần ôn").
2. **Given** the streak is 0 (broken yesterday), **When** the hero screen renders, **Then** the motivator shows: "Bắt đầu chuỗi mới hôm nay! 💪" — encouraging, not shaming.
3. **Given** today is Day 30 (sprint milestone), **When** the hero screen renders, **Then** it shows a special badge: "🏆 Sprint 1 Finale! Buổi học cuối cùng trước khi tốt nghiệp Daily Standup."

---

### User Story 3 - Skip to Lesson (Power User Bypass) (Priority: P3)

As a returning learner who knows exactly what they want to do, I want a small "Bỏ qua → Xem bài học" link on the hero screen to skip directly to the full lesson UI without starting the timer, so that I can browse content or review previous days.

**Why this priority**: Power users shouldn't be forced through the hero screen. A discreet bypass respects experienced learners.

**Independent Test**: Click "Bỏ qua", verify the full lesson UI shows without the timer starting.

**Acceptance Scenarios**:

1. **Given** the hero start screen is showing, **When** the user clicks "Bỏ qua → Xem bài học" (small text link below the main button), **Then** the hero overlay dismisses, the full lesson UI shows, but the timer does NOT start.
2. **Given** the user frequently skips the hero screen, **When** they've skipped 5+ times, **Then** the app does NOT disable the hero screen — it always shows for incomplete sessions to preserve the one-tap ritual.

---

### Edge Cases

- What if the user navigates away (e.g., to Curriculum tab) and back to Workspace? → Hero screen does NOT reappear if already dismissed this session. It's a one-time-per-session gate.
- What if the timer is already running (e.g., user paused and came back)? → Hero screen does NOT show. Go straight to lesson with timer resumed.
- What about the day switcher (prev/next day)? → Hero screen only shows for the current scheduled day, not when browsing other days.
- What about first-time users on Day 1? → Hero screen shows with extra welcome text: "Chào mừng! Hành trình 90 ngày bắt đầu từ đây. 🚀"

## Requirements

### Functional Requirements

- **FR-001 (Hero Overlay)**: System MUST display a full-width centered hero card when the workspace view loads and today's session is incomplete.
- **FR-002 (One-Tap Start)**: The primary CTA "▶ Bắt Đầu" MUST be a large button (min 48px height, full-width on mobile) that triggers: timer start + hero dismiss + lesson reveal.
- **FR-003 (Quick Mode Integration)**: If spec 005 (Micro-Lesson) is implemented, a secondary "⚡ Quick 10min" button MUST appear below the primary CTA.
- **FR-004 (Contextual Info)**: Hero card MUST display: day number + title, sprint badge, one-line objective, streak count, and SRS due count.
- **FR-005 (Session-Gated)**: Hero screen MUST only show once per session for the current scheduled day. Dismissal (start or skip) persists in `sessionStorage`.
- **FR-006 (Completed Day Bypass)**: If today's session is already `Completed` or `CompletedPartial`, hero screen MUST NOT show.
- **FR-007 (Power User Bypass)**: A small "Bỏ qua" text link MUST be available to dismiss without starting timer.
- **FR-008 (Warm-Up Chain)**: If spec 007 (SRS Warm-Up) is implemented, clicking "▶ Bắt Đầu" MUST trigger warm-up first, then reveal the lesson after warm-up completes.
- **FR-009 (Timer Auto-Start)**: Clicking "▶ Bắt Đầu" MUST automatically start the 30-minute Pomodoro timer.

### Key Entities

- **HeroScreenState**: `shown` (bool), `dismissedAt` (timestamp), `dismissType` ("start" | "quick" | "skip").

---

## Success Criteria

- **SC-001 (Time to First Action)**: From page load to timer running takes exactly 1 tap and <1 second.
- **SC-002 (Decision Elimination)**: Zero cognitive decisions needed — the learner sees one button and presses it.
- **SC-003 (Skip Rate)**: "Bỏ qua" usage stays below 30% (most users start via the hero button).
- **SC-004 (Session Start Rate)**: Sessions started per day should increase after this feature (measured over 2 weeks).

---

## Assumptions & Boundaries

- Hero screen is a DOM overlay/card within the existing `#view-workspace`, not a separate page/route.
- Implemented with CSS + JS; no routing changes.
- The hero screen does NOT replace the lesson UI — it sits on top of it and reveals it on dismiss.
- Compatible with all other specs: integrates with warm-up (007), micro-lesson (005), and collapsible blocks (011).
- First-time Day 1 welcome text is hardcoded, not a configurable onboarding system.
