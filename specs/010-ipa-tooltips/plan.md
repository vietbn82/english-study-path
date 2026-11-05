# Implementation Plan: Contextual Tooltips on IPA Symbols

**Branch**: `010-ipa-tooltips` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/010-ipa-tooltips/spec.md)

## Summary
Add plain-language hover tooltips to all IPA symbols across the UI. Each tooltip includes: Vietnamese sound equivalent, physical mouth placement instruction in plain Vietnamese, 2 IT example words, and a 1-click TTS button to hear the sound in isolation.

## Technical Context
- **Framework**: .NET 10 Minimal API
- **Data**: Centralized IPA glossary service (`IIpaGlossaryService`)
- **Frontend**: Lightweight popover component with Web Speech API audio hook
- **Testing**: xUnit + FluentAssertions
