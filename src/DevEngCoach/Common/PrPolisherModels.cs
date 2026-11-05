namespace DevEngCoach.Common;

/// <summary>
/// Predefined tone options for PR and tech communication polishing.
/// </summary>
public enum PrPolishTone
{
    ConstructiveReview,
    DiplomaticPushback,
    TechnicalInquiry,
    Compliment,
    CommitMessage
}

/// <summary>
/// String tone constants matching <see cref="PrPolishTone"/> for string-based API requests.
/// </summary>
public static class PrPolishTones
{
    public const string ConstructiveReview = nameof(PrPolishTone.ConstructiveReview);
    public const string DiplomaticPushback = nameof(PrPolishTone.DiplomaticPushback);
    public const string TechnicalInquiry = nameof(PrPolishTone.TechnicalInquiry);
    public const string Compliment = nameof(PrPolishTone.Compliment);
    public const string CommitMessage = nameof(PrPolishTone.CommitMessage);

    public static PrPolishTone Parse(string? tone)
    {
        if (string.IsNullOrWhiteSpace(tone))
        {
            return PrPolishTone.ConstructiveReview;
        }

        var normalized = tone.Trim().Replace(" ", "").Replace("-", "").Replace("_", "");
        return Enum.TryParse<PrPolishTone>(normalized, ignoreCase: true, out var result)
            ? result
            : PrPolishTone.ConstructiveReview;
    }
}

/// <summary>
/// Request payload for polishing technical comments or commit messages.
/// </summary>
public sealed record PrPolishRequest(
    string InputText,
    string Tone = PrPolishTones.ConstructiveReview,
    string? CodeContext = null
);

/// <summary>
/// Result of the PR/commit polishing operation.
/// </summary>
public sealed record PrPolishResponse(
    string PolishedText,
    string Explanation,
    IReadOnlyList<string> KeyPhrasesUsed,
    IReadOnlyList<string> AvoidedAntiPatterns,
    string AlternativeDraft
);
