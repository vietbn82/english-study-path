# Implementation Plan: Slow-Motion Phoneme Playback

**Branch**: `012-slow-motion-playback` | **Date**: 2026-11-06 | **Spec**: [spec.md](file:///E:/english/specs/012-slow-motion-playback/spec.md)

## Summary
Add a 0.5x slow-motion audio button (🐢) next to every 🔊 button across vocabulary drills, sentence frames, and contrastive pairs. Enable a global playback speed selector (0.5x, 0.75x, 1x, 1.25x) stored in `localStorage`, and implement sequential slow comparison ("🐢 So sánh chậm") for contrastive sound pairs.

## Technical Context
- **Frontend**: Web Speech Synthesis API (`SpeechSynthesisUtterance.rate`), HTML5 Audio API (`HTMLAudioElement.playbackRate`), `localStorage` persistence (`deveng_playback_speed`).
- **Web Components**: Integrates with `<deveng-selection-lookup>` and `<deveng-sound-modal>` for consistent speed handling.
- **Testing**: Frontend audio unit test helper and integration verification.
