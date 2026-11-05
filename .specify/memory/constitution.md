# DevEng Coach Constitution
<!-- Spec Kit Project Constitution: English Mastery for Vietnamese Software Engineers -->

## Core Principles

### Principle I: Product Purpose Inviolability (Anti-Drift Guardrail)
The sole purpose of this product is to enable a 33-year-old Vietnamese software developer with lost roots and poor sound perception to achieve professional fluency in technical presentations (Standup, Demo, Architecture Review) and workplace conversations (1-on-1, Tech Debate, Small Talk) within 90 days (30 mins/day at 22:00).
- **Inviolability Rule**: Any future enhancement, extension, AI feature, or UI addition MUST directly serve this 30-minute daily ritual.
- **Scope Exclusion**: General English topics (travel, cooking, academic IELTS/TOEFL vocabulary, irrelevant idioms) and unguided internet browsing are strictly prohibited. The focus is exclusively DEEP technical & workplace communication.

### Principle II: Zero-Friction & Zero-Research (Pre-Packaged Daily Lessons)
At 22:00, when the user opens the application:
- Every asset for Day N must be 100% pre-compiled: articulatory cross-section descriptions, target phoneme contrast drills, IT-specific word lists, 2 frozen sentence frames, and the practice task.
- The learner NEVER needs to search YouTube, Google, or dictionaries during study time. Time-to-practice must be under 5 seconds.

### Principle III: Kinesthetic Articulatory Primacy (Physics over Auditory Mimicry)
Because the learner suffers from poor auditory perception and native Vietnamese phonological interference (unreleased final codas, lack of fricatives, syllable-timed cadence):
- Pronunciation teaching MUST be grounded in physical articulatory mechanics: active articulators (tongue tip, blade, dorsum, lips), passive contact points (alveolar ridge, upper teeth, hard palate), manner of airstream release, and vocal cord vibration (voicing).
- Auditory mimicry ("listen and repeat blindly") is forbidden as a primary instruction method.

### Principle IV: Chunk-Based Functional Synthesis (No Translation Grammar)
Grammar rules (tenses, conjugation drills) must not be taught in isolation. The system must train muscle-memory sentence frames (lexical chunks) with plug-and-play slots for software modules, tickets, blockers, and trade-offs. The learner speaks by plugging domain knowledge into pre-wired English sentence templates.

### Principle V: Clean .NET Architecture & Local Resilience
- **Backend**: C# 12+ / .NET 10 Minimal API. File-scoped namespaces, primary constructors, clean architecture, high task efficiency, zero bloated dependencies.
- **Storage**: Local-first embedded storage (JSON / SQLite) tracking daily completions, actual vs. planned duration, streak, and audio evaluation records.
- **AI Assistant**: Native integration with Antigravity (AI Coach) / local AI runner for prompt evaluation and instant pronunciation/grammar feedback.
- **Notifications**: Automated 22:00 daily reminder hook.

---

## Technical Constraints & Standards

1. **Local Self-Containment**: The entire web dashboard and study materials run locally on `localhost`. Offline availability is required for all pre-compiled text, phonetic guides, and core frames.
2. **Deterministic UI State**: The dashboard presents a single-page view showing:
   - Calendar / Timeline: Day 1 to Day 90 with status (`Completed`, `Pending`, `Skipped`).
   - Planned vs. Actual progress metrics.
   - Day N Workspace: The 3-stage Pomodoro (10m Articulatory Drill -> 10m Sentence Frame -> 10m AI Output).
   - Embedded AI Coach Assistant console for immediate submission and feedback.
3. **Telemetry & Feedback Integrity**: Progress tracking must accurately differentiate between "Plan" (30m target at 22:00) and "Actual" (real time spent, completion timestamp, performance score).

---

## Governance & Amendment

- This Constitution is the supreme design document for the codebase.
- Any pull request, automated agent task, or feature proposal that introduces scope drift, increases learner cognitive friction, or contradicts the Kinesthetic Articulatory principle will be rejected.
- Amendments require explicit user approval and must document why the change does not compromise the core 90-day outcome.

**Version**: 1.0.0 | **Ratified**: 2026-11-04 | **Status**: Active
