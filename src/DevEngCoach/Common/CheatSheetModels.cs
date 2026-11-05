namespace DevEngCoach.Common;

public sealed record CheatSheetPhonemeRow(
    string Symbol,
    string SoundName,
    string MouthPlacementCueVi,
    IReadOnlyList<string> DevWords
);

public sealed record CheatSheetFrameRow(
    int Number,
    string Category, // "Yesterday", "Today", "Blocker", "Architecture"
    string TemplatePattern,
    string TranslationVi
);

public sealed record CheatSheetWordRow(
    string Word,
    string Ipa,
    string MeaningVi,
    string Cue
);

public sealed record SprintCheatSheet(
    int SprintId,
    string SprintTitle,
    string FocusObjective,
    IReadOnlyList<CheatSheetFrameRow> SentenceFrames,
    IReadOnlyList<CheatSheetPhonemeRow> TargetPhonemes,
    IReadOnlyList<CheatSheetWordRow> EssentialVocabulary
);
