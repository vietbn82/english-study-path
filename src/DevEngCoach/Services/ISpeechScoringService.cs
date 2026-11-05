using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface ISpeechScoringService
{
    Task<SpeechScoreResponse> ScoreSpeechAsync(SpeechScoreRequest request, CancellationToken ct = default);
    Task<SpeechSummaryResponse> GetSummaryAsync(CancellationToken ct = default);
    Task<IReadOnlyList<DrillScoreRecord>> GetHistoryAsync(int limit = 50, CancellationToken ct = default);
}
