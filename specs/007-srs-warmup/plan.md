# Implementation Plan: Spaced Repetition Warm-Up

**Branch**: `007-srs-warmup` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/007-srs-warmup/spec.md)

## Summary
Inject a 2-minute quick-fire review of 5 weak words pulled from the Leitner SRS queue before today's lesson starts. Features a 2:00 countdown timer, smart selection (Box 1 priority), immediate promote/demote action, and seamless transition to the main lesson.

## Technical Context
- **Framework**: .NET 10 Minimal API
- **Service**: `ISrsWarmupService` & `SrsWarmupService`
- **Integration**: `ISrsService`
- **Frontend**: Full-screen / modal warm-up overlay with 2:00 countdown and quick responses
- **Testing**: xUnit + FluentAssertions
