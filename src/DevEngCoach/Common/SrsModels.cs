namespace DevEngCoach.Common;

public sealed record SrsItem(
    string Id,
    string WordOrPhrase,
    string TargetPhoneme,
    string ContextSentence,
    DateTime NextReviewDate,
    int IntervalDays,
    int Box,
    int ConsecutiveCorrect,
    int LastScore,
    int ReviewCount
);

public sealed record SrsReviewRequest(
    string ItemId,
    int Score
);

public sealed record SrsEnrollRequest(
    string WordOrPhrase,
    string TargetPhoneme,
    string ContextSentence,
    int InitialScore
);

public sealed record SrsStats(
    int TotalTracked,
    int DueToday,
    int Mastered,
    double AverageScore
);
