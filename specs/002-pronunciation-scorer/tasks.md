# Task Breakdown: Speech-to-Text Pronunciation Scorer

**Feature**: `002-pronunciation-scorer` | **Spec**: [spec.md](file:///E:/english/specs/002-pronunciation-scorer/spec.md) | **Plan**: [plan.md](file:///E:/english/specs/002-pronunciation-scorer/plan.md)

---

## Phase 1: Domain Models & Vietnamese Interference Rules

- [x] **Task 1.1**: Create `Common/SpeechScoringModels.cs`:
  - `PhonemeCategory` enum: `EndingConsonant`, `DentalFricative`, `PalatalAffricate`, `ConsonantCluster`, `Vowel`.
  - `PhonemeResult`: `TargetPhoneme`, `DetectedPhoneme`, `IsCorrect`, `Category`, `KinestheticCorrectionTip`.
  - `SpeechScoreRequest`: `DayNumber`, `TargetWordOrSentence`, `ExpectedPhonemes`, `SpokenText`.
  - `SpeechScoreResponse`: `OverallAccuracy` (0-100), `IsPassing`, `PhonemeBreakdown` (List of `PhonemeResult`), `AutoEnrolledInSrs` (bool), `FeedbackSummary`.
  - `DrillScoreRecord`: `SessionId`, `Timestamp`, `DayNumber`, `AverageAccuracy`, `CategoryScores`.

---

## Phase 2: Speech Scoring Engine & SRS Integration

- [x] **Task 2.1**: Implement `ISpeechScoringService` and `SpeechScoringService`:
  - Rule-based phoneme alignment engine comparing expected phoneme tokens against phonetic transcription.
  - Specialized Vietnamese phonological interference detectors:
    - Dropped stop codas (`/t/`, `/d/`, `/k/`, `/p/`).
    - Dental fricative substitutions (`/θ/` -> `/t/` or `/s/`, `/ð/` -> `/z/` or `/d/`).
    - Palatal fricative & affricate flattening (`/ʃ/` -> `/s/`, `/tʃ/` -> `/s/`, `/dʒ/` -> `/z/`).
    - Cluster dropping (e.g. `skr`, `kst`, `lks`).
  - Kinesthetic correction provider mapping phonetic errors to exact mouth mechanics from curriculum.
  - Integration with `ISrsService`: Automatically trigger `srsService.AutoEnrollWeakSpot(word, targetPhoneme, score)` whenever `OverallAccuracy < 60`.
  - Score persistence in `Data/speech_scores.json`.

---

## Phase 3: Minimal API Endpoints

- [x] **Task 3.1**: Register `ISpeechScoringService` in DI (`Program.cs`).
- [x] **Task 3.2**: Add endpoints in `Program.cs`:
  - `POST /api/speech/score`: Accepts `SpeechScoreRequest` and returns `SpeechScoreResponse`.
  - `POST /api/speech/transcribe`: Accepts audio upload, provides fallback phonetic string.
  - `GET /api/speech/scores/summary`: Returns category breakdown metrics (Ending Consonants %, Fricatives %, Clusters %).
  - `GET /api/speech/scores/history`: Returns historical drill sessions.

---

## Phase 4: Frontend UI & Real-Time Color Coder

- [x] **Task 4.1**: Enhance `wwwroot/index.html` with Pronunciation Scorer Widget:
  - Microphone capture button (`🎤 Record & Grade`) on each vocabulary word and sentence frame.
  - Visual color-coded phoneme breakdown container (`green` for correct, `orange` for partial, `red` for missed/dropped).
  - Hover/click tooltip displaying kinesthetic placement reminder (e.g., *"Tongue tip taps alveolar ridge and releases burst"*).
  - Score summary card displaying 0–100 score with SRS auto-enrollment badge.
- [x] **Task 4.2**: Implement audio capture and API integration in `wwwroot/app.js`:
  - Web Speech API `SpeechRecognition` handler with fallback to MediaRecorder blob upload.
  - Asynchronous submission to `/api/speech/score` and real-time DOM rendering of phoneme badges.

---

## Phase 5: Automated Testing & Verification

- [x] **Task 5.1**: Author unit tests in `tests/DevEngCoach.Tests/SpeechScoringServiceTests.cs`:
  - Test dropped ending consonant detection.
  - Test `/θ/` -> `/t/` substitution detection.
  - Test cluster reduction detection.
  - Test SRS auto-enrollment trigger when score < 60.
- [x] **Task 5.2**: Integration tests for API endpoints in `tests/DevEngCoach.Tests/ApiIntegrationTests.cs`.
- [x] **Task 5.3**: End-to-end verification and `dotnet test` confirmation.
