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

// 1. Daily Standup Mastery (3-Part: Yesterday, Today, Blockers)
public sealed record StandupSimulationRequest(
    string Yesterday,
    string Today,
    string? Blockers = null
);

public sealed record StandupSimulationResponse(
    bool Success,
    string GrammarFeedback,
    IReadOnlyList<string> EndingConsonantsFeedback,
    string SeniorTechLeadRefactor,
    int FluencyScore,
    string DeliveryTip
);

// 2. Sprint Demo Walkthrough (Context, Architecture, Technical Highlights, Q&A Invite)
public sealed record ConnectedSpeechFeedback(
    IReadOnlyList<string> LinkingAlerts,
    IReadOnlyList<string> FlapTAlerts,
    IReadOnlyList<string> WeakFormsAlerts
);

public sealed record DemoSimulationRequest(
    string Context,
    string Architecture,
    string TechnicalHighlights,
    string QaInvite
);

public sealed record DemoSimulationResponse(
    bool Success,
    string GrammarAndStructureFeedback,
    ConnectedSpeechFeedback ConnectedSpeech,
    string SeniorDevPresentationScript,
    int FluencyScore,
    string PacingTip
);

// 3. Small Talk A-D-Q Formula (Answer -> Detail -> Question back)
public sealed record PingPongSimulationRequest(
    string? Topic = null,
    string? Answer = null,
    string? Detail = null,
    string? QuestionBack = null,
    string? FullResponse = null
);

public sealed record PingPongSimulationResponse(
    bool Success,
    int NaturalnessScore,
    string PingPongTransitionQuality,
    bool HasDirectAnswer,
    bool HasDetail,
    bool HasQuestionBack,
    string Feedback,
    string SeniorDevRefactoring
);
