using DevEngCoach.Common;

namespace DevEngCoach.Services;

public record UserProgressSummary(
    int CurrentStreakDays = 0,
    int LongestStreakDays = 0,
    int TotalCompletedDays = 0,
    int TotalPlannedDays = 90,
    int TotalActualMinutesSpent = 0,
    int TotalPlannedMinutesExpected = 0,
    int VarianceMinutes = 0,
    double CompletionPercentage = 0,
    int NextDayNumber = 1
);

public record SessionRecord(
    int DayNumber,
    DateTime ScheduledDate,
    DateTime? CompletedAt,
    int PlannedMinutes,
    int ActualMinutes,
    string Status,
    int? SelfRating = null,
    string? LearnerNotes = null,
    string? AiFeedbackSnippet = null
);

public record SpeechScoreRecord(
    string SessionId,
    DateTime Timestamp,
    int DayNumber,
    string TargetText,
    int OverallAccuracy,
    IReadOnlyList<CategoryScore>? CategoryScores = null
);

public record BackupPayload(
    int Version,
    DateTime ExportedAt,
    UserProgressSummary Progress,
    List<SessionRecord> Sessions,
    List<SrsItem> SrsItems,
    List<SpeechScoreRecord> SpeechScores
);

public record BackupImportResult(
    bool Success,
    string Message,
    int RestoredSessionsCount,
    int RestoredSrsItemsCount
);

public interface IBackupService
{
    BackupPayload GetFullBackup();
    BackupImportResult ImportBackup(BackupPayload payload);
}
