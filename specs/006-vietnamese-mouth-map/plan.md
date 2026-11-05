# Implementation Plan: Vietnamese Mouth-Map Comparison

**Branch**: `006-vietnamese-mouth-map` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/006-vietnamese-mouth-map/spec.md)

## Summary
Provide side-by-side contrastive articulatory diagrams for every target phoneme: Left card shows "🇻🇳 Your Vietnamese Habit" (e.g., unreleased coda /t/), Right card shows "🇬🇧 English Target" (e.g., alveolar tap + air burst), with common Vietnamese interference callouts and visual tongue/lip position transitions.

## Technical Context
- **Framework**: .NET 10 Minimal API
- **Service**: `IMouthMapService` & `MouthMapService` providing structured contrastive mouth data per phoneme
- **Frontend**: Responsive SVG cross-sections, Vietnamese mistake alerts, animated transition toggle
- **Testing**: xUnit + FluentAssertions
