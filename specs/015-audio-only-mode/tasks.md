# Task Breakdown: Audio-Only Mode (Eyes-Free)

**Feature**: `015-audio-only-mode` | **Spec**: [spec.md](file:///E:/english/specs/015-audio-only-mode/spec.md) | **Plan**: [plan.md](file:///E:/english/specs/015-audio-only-mode/plan.md)

- [x] **Task 1**: Audio script generator function: compile `Lesson` into an ordered queue of `AudioSegment` items (Vietnamese instructions, English targets, practice pauses).
- [x] **Task 2**: Audio narration player engine with Web Speech Synthesis (`vi-VN` / `en-US`), speech rate integration (spec 012), and Web Audio practice chime.
- [x] **Task 3**: Eyes-free minimal HUD overlay in `index.html` with large touch targets (80px Pause/Resume, Repeat, Skip) and 30s OLED auto-dim.
- [x] **Task 4**: Tap gesture controls: single tap to pause/resume, double tap to repeat current item, swipe/skip to next block.
- [x] **Task 5**: Auto-completion on session end: mark session `Completed` with `SessionMode: AudioOnly`.
- [x] **Task 6**: Integration tests for `SessionMode` persistence and frontend eyes-free testing.
