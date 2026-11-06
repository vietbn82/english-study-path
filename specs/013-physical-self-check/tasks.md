# Task Breakdown: "Cảm Nhận Cơ Thể" Physical Self-Check Prompts

**Feature**: `013-physical-self-check` | **Spec**: [spec.md](file:///E:/english/specs/013-physical-self-check/spec.md) | **Plan**: [plan.md](file:///E:/english/specs/013-physical-self-check/plan.md)

- [x] **Task 1**: Define `TACTILE_SELF_CHECKS` catalog covering Stops, Fricatives, Affricates, Nasals, Interdentals, and Vowels in `app.js` / JSON.
- [x] **Task 2**: Implement non-blocking self-check slide-in card component with binary feedback buttons ("✅ Đã cảm nhận đúng" / "❌ Chưa đúng, thử lại").
- [x] **Task 3**: Trigger self-check card after audio practice or speech evaluation in Stage 1 (Phonetics).
- [x] **Task 4**: Implement adaptive frequency logic in `localStorage`: reduce to every 3rd word after 5 correct, auto-hide after 10 correct.
- [x] **Task 5**: Unit test adaptive frequency transitions and verify UI non-blocking behavior.
