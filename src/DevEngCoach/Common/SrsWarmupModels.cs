namespace DevEngCoach.Common;

public sealed record SrsWarmupItem(
    string ItemId,
    string WordOrPhrase,
    string TargetPhoneme,
    string ContextSentence,
    int Box,
    string CueNote
);

public sealed record SrsWarmupBatch(
    IReadOnlyList<SrsWarmupItem> Items,
    int TotalDueInSrs,
    bool ShouldSkipWarmup,
    string MotivationalCue
);
