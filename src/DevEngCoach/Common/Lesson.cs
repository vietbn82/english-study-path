namespace DevEngCoach.Common;

public sealed record Lesson(
    int DayNumber,
    int SprintId,
    string SprintTitle,
    string Title,
    string FocusObjective,
    PhoneticsGuide Phonetics,
    IReadOnlyList<VocabularyDrill> VocabularyDrills,
    IReadOnlyList<SentenceFrame> SentenceFrames,
    PracticeTask PracticeTask
);

public sealed record VocabularyDrill(
    string Word,
    string Ipa,
    string MeaningVi,
    string TechnicalContext,
    string PhysicalNote
);

public sealed record SentenceFrame(
    string TemplateName,
    string TemplatePattern,
    string ExampleUsage,
    string VietnameseTranslation,
    IReadOnlyList<string> DevVariables
);

public sealed record PracticeTask(
    string Prompt,
    string ScenarioVi,
    string ExpectedStructure,
    string SelfCheckReminder
);
