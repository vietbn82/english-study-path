namespace DevEngCoach.Common;

/// <summary>
/// Represents a high-stakes technical scenario for executive sparring.
/// </summary>
public sealed record SparringScenario(
    string Id,
    string Title,
    string Category,
    string RoleDescription,
    string OpeningLine,
    IReadOnlyList<string> KeyVocabulary
);

/// <summary>
/// A single conversational exchange in a sparring session.
/// </summary>
public sealed record SparringTurnMessage(
    string Speaker, // "user" | "ai"
    string Content
);

/// <summary>
/// User turn payload submitted to the sparring partner.
/// </summary>
public sealed record SparringTurnRequest(
    string ScenarioId,
    string UserSpeech,
    IReadOnlyList<SparringTurnMessage>? History = null
);

/// <summary>
/// Comprehensive feedback, scores, and counter-question from the sparring partner.
/// </summary>
public sealed record SparringResponse(
    string AiResponse,
    int DiplomacyScore,
    int TechnicalClarityScore,
    IReadOnlyList<string> PronunciationAlerts,
    IReadOnlyList<string> FillerWordsDetected,
    string SeniorLeadRefinement,
    string NextQuestion
);
