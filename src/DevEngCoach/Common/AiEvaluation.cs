namespace DevEngCoach.Common;

public sealed record AiEvaluationRequest(
    int DayNumber,
    string InputText,
    string? AudioBase64 = null
);

public sealed record AiEvaluationResponse(
    bool Success,
    string OriginalText,
    string GrammarCorrections,
    IReadOnlyList<string> PhoneticMechanicsAlerts,
    string SeniorDevRefactoring,
    string NaturalSpeakingTip,
    int FluencyScore // 1 to 100
);
