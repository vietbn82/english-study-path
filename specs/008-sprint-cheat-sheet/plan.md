# Implementation Plan: Printable Sprint Cheat Sheet

**Branch**: `008-sprint-cheat-sheet` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/008-sprint-cheat-sheet/spec.md)

## Summary
Generate a high-density, printable single-page A4 summary for each sprint containing all sentence frames, phoneme guides, and key IT vocabulary. Designed for physical printing next to developers' monitors or quick Alt-Tab referencing during live meetings.

## Technical Context
- **Framework**: .NET 10 Minimal API
- **Service**: `ICheatSheetService` & `CheatSheetService`
- **Frontend**: Print-optimized stylesheet (`@media print`), A4 dimensions, digital quick-view drawer
- **Testing**: xUnit + FluentAssertions
