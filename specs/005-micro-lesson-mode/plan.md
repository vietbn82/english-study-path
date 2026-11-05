# Implementation Plan: Micro-Lesson Mode (10-Minute Escape Hatch)

**Branch**: `005-micro-lesson-mode` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/005-micro-lesson-mode/spec.md)

## Summary
Provide a 10-minute escape hatch allowing tired developers at 22:00 to complete any one of the 3 daily blocks (Phonetics, Frames, or Output). The session counts toward maintaining the daily streak with partial credit status (`CompletedPartial`), eliminating the all-or-nothing psychology that causes skipped days.

## Technical Context
- **Framework**: .NET 10 Minimal API
- **Storage**: `Data/progress.json` with `BlocksCompleted` and `CompletionMode`
- **Frontend**: Zero-build vanilla JS + Tailwind CSS
- **Testing**: xUnit + FluentAssertions

## Key Endpoints & Changes
- `POST /api/progress/micro-complete`: Records single-block completion, increments streak.
- `GET /api/microlesson/recommendation`: Recommends highest-impact block based on recent SRS weak spots and speaking recency.
