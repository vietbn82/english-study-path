# Implementation Plan: "Cảm Nhận Cơ Thể" Physical Self-Check Prompts

**Branch**: `013-physical-self-check` | **Date**: 2026-11-06 | **Spec**: [spec.md](file:///E:/english/specs/013-physical-self-check/spec.md)

## Summary
Provide category-specific physical tactile verification prompts (touching throat for vibration, palm in front of lips for airflow burst, mirror for tongue protrusion) appearing after phoneme drills. Includes binary feedback logging ("✅ Đã cảm nhận đúng" / "❌ Chưa đúng, thử lại") with adaptive frequency control reducing prompts after 5 and 10 consecutive correct checks.

## Technical Context
- **Dataset**: Embedded library of tactile check prompts indexed by phoneme category (Stops, Fricatives, Affricates, Nasals, Interdentals, Vowels).
- **Frontend**: Slide-in non-blocking toast/card below drill words, `localStorage` adaptive frequency tracking (`deveng_selfcheck_stats`).
- **Testing**: xUnit verification of self-check categories and frontend adaptive frequency logic.
