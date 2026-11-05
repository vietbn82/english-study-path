# Implementation Plan: Collapsible/Expandable Blocks with Timer Sync

**Branch**: `011-collapsible-blocks` | **Date**: 2026-11-05 | **Spec**: [spec.md](file:///E:/english/specs/011-collapsible-blocks/spec.md)

## Summary
Add smooth collapsible accordion headers to the 3 daily blocks. Synchronize auto-expansion with the 30-minute Pomodoro timer phases (0-10m: Phonetics, 10-20m: Frames, 20-30m: Output) with manual overrides and a global "Expand All / Collapse All" toggle to reduce visual clutter on 1080p screens.

## Technical Context
- **Frontend**: CSS transitions, DOM phase listener hooked to timer ticks, localStorage persistence for block state
- **Testing**: Frontend interaction verification & smoke tests
