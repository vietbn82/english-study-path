# Implementation Plan: "Bắt Đầu Ngay" One-Tap Start

**Branch**: `014-one-tap-start` | **Date**: 2026-11-06 | **Spec**: [spec.md](file:///E:/english/specs/014-one-tap-start/spec.md)

## Summary
Replace the multi-element initial workspace with a centered, distraction-free hero start card for incomplete daily sessions: "▶ Bắt Đầu Ngày [N] (30 phút)". Tapping it auto-starts the Pomodoro timer, triggers SRS warm-up (spec 007), expands Block 1 (spec 011), and reveals the full lesson. Includes a secondary "⚡ Quick 10min" button and a discreet "Bỏ qua" bypass.

## Technical Context
- **Frontend**: Clean CSS overlay/hero card inside `#view-workspace`, `sessionStorage` gate (`deveng_hero_dismissed_day`), timer auto-start integration.
- **Workflow**: Auto-chains SRS Warm-Up modal -> Block 1 auto-expansion -> 30-minute timer start.
- **Testing**: State gating verification and unit tests for session completion check.
