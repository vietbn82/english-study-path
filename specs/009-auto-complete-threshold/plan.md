# Implementation Plan: "Good Enough" 70% Auto-Complete Threshold

**Branch**: `009-auto-complete-threshold` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/009-auto-complete-threshold/spec.md)

## Summary
Prevent perfectionism paralysis by automatically completing daily drill sessions once the learner reaches 70% accuracy (e.g., 7/10 words). Displays a celebration banner, marks the session as `Completed`, and auto-enrolls the remaining weak words into tomorrow's SRS queue.

## Technical Context
- **Framework**: .NET 10 Minimal API
- **Integration**: `ISpeechScoringService` & `ISrsService`
- **Frontend**: Live accuracy tracker, auto-complete banner trigger, "Keep Going" button
- **Testing**: xUnit + FluentAssertions
