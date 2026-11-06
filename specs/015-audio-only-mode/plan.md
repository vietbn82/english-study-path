# Implementation Plan: Audio-Only Mode (Eyes-Free)

**Branch**: `015-audio-only-mode` | **Date**: 2026-11-06 | **Spec**: [spec.md](file:///E:/english/specs/015-audio-only-mode/spec.md)

## Summary
Add an eyes-free "🎧 Chế độ Nghe" allowing exhausted learners at 22:00 to practice with their eyes closed. The engine auto-generates a sequenced narration script from lesson data: Vietnamese instructions and mechanical guidance via `vi-VN` TTS, English target sounds and sentence frames via `en-US` TTS, with timed practice pauses and audio chimes. Includes large touch targets (Pause, Repeat, Skip) and auto-completion tracking.

## Technical Context
- **Script Generation**: Client-side sequencer generating `AudioSegment` objects from `Lesson` entity.
- **Speech Engine**: Web Speech Synthesis API (`lang: 'vi-VN'` with `'en-US'` fallback for instructions, `lang: 'en-US'` for vocabulary/frames).
- **Audio Effects**: Web Audio API oscillator synthesis for practice cue beeps/chimes.
- **UI**: Full-screen dimmed dark HUD (32px typography, 80px play/pause touch target, 30s OLED auto-dim).
- **Backend/Progress**: Extend `SessionRecord` / `CompleteSessionRequest` with `SessionMode` ("Visual" | "AudioOnly").
