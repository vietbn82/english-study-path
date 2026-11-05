namespace DevEngCoach.Common;

public sealed record MouthMapEntry(
    string Phoneme,
    string SoundName,
    string VietnameseHabitTitle,
    string VietnameseHabitDescription,
    string EnglishTargetTitle,
    string EnglishTargetDescription,
    string CommonMistakeAlertVi,
    string KinestheticFixInstruction,
    IReadOnlyList<string> DevExampleWords,
    string MovementDirection
);
