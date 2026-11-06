using DevEngCoach.Common;

namespace DevEngCoach.Services;

public record SessionRecord(
    int DayNumber,
    DateTime ScheduledDate,
    DateTime? CompletedAt,
    int PlannedMinutes,
    int ActualMinutes,
    string Status,
    int? SelfRating = null,
    string? LearnerNotes = null,
    string? AiFeedbackSnippet = null,
    string? SessionMode = "Visual"
);

public interface IProgressService
{
    ProgressSummary GetSummary();
    IReadOnlyList<SessionLog> GetAllSessions();
    SessionLog? GetSessionByDay(int dayNumber);
    SessionLog CompleteSession(CompleteSessionRequest request);
    SessionLog MicroCompleteSession(MicroSessionRequest request);
    BlockRecommendation GetRecommendation();
    void ResetProgress();
    int RestoreSessions(IEnumerable<SessionLog> sessions);
}
