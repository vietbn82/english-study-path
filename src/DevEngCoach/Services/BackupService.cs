using DevEngCoach.Common;

namespace DevEngCoach.Services;

public sealed class BackupService(
    IProgressService progressService,
    ISrsService srsService,
    ISpeechScoringService speechScoringService
) : IBackupService
{
    private const int CurrentBackupVersion = 1;

    public BackupPayload GetFullBackup()
    {
        var summary = progressService.GetSummary();
        var progress = new UserProgressSummary(
            CurrentStreakDays: summary.CurrentStreakDays,
            LongestStreakDays: summary.LongestStreakDays,
            TotalCompletedDays: summary.TotalCompletedDays,
            TotalPlannedDays: summary.TotalPlannedDays,
            TotalActualMinutesSpent: summary.TotalActualMinutesSpent,
            TotalPlannedMinutesExpected: summary.TotalPlannedMinutesExpected,
            VarianceMinutes: summary.VarianceMinutes,
            CompletionPercentage: summary.CompletionPercentage,
            NextDayNumber: summary.NextDayNumber
        );

        var sessions = progressService.GetAllSessions()
            .Select(s => new SessionRecord(
                DayNumber: s.DayNumber,
                ScheduledDate: s.ScheduledDate,
                CompletedAt: s.CompletedAt,
                PlannedMinutes: s.PlannedMinutes,
                ActualMinutes: s.ActualMinutes,
                Status: s.Status,
                SelfRating: s.SelfRating,
                LearnerNotes: s.LearnerNotes,
                AiFeedbackSnippet: s.AiFeedbackSnippet
            ))
            .ToList();

        var srsItems = srsService.GetAllItems().ToList();

        var speechHistory = speechScoringService.GetHistoryAsync(int.MaxValue)
            .GetAwaiter().GetResult()
            .Select(d => new SpeechScoreRecord(
                SessionId: d.SessionId,
                Timestamp: d.Timestamp,
                DayNumber: d.DayNumber,
                TargetText: d.TargetText,
                OverallAccuracy: d.OverallAccuracy,
                CategoryScores: d.CategoryScores
            ))
            .ToList();

        return new BackupPayload(
            Version: CurrentBackupVersion,
            ExportedAt: DateTime.UtcNow,
            Progress: progress,
            Sessions: sessions,
            SrsItems: srsItems,
            SpeechScores: speechHistory
        );
    }

    public BackupImportResult ImportBackup(BackupPayload payload)
    {
        if (payload is null)
        {
            return new BackupImportResult(
                Success: false,
                Message: "Backup payload cannot be null.",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }

        if (payload.Version <= 0 || payload.Version > CurrentBackupVersion)
        {
            return new BackupImportResult(
                Success: false,
                Message: $"Unsupported backup version '{payload.Version}'. Current supported version is {CurrentBackupVersion}.",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }

        if (payload.Sessions is null || payload.SrsItems is null || payload.SpeechScores is null)
        {
            return new BackupImportResult(
                Success: false,
                Message: "Corrupted backup: one or more required collections are null.",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }

        if (payload.Sessions.Any(s => s is null || s.DayNumber < 1 || string.IsNullOrWhiteSpace(s.Status) || s.PlannedMinutes < 0 || s.ActualMinutes < 0))
        {
            return new BackupImportResult(
                Success: false,
                Message: "Corrupted backup: sessions collection contains invalid records.",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }

        if (payload.SrsItems.Any(item => item is null || string.IsNullOrWhiteSpace(item.Id) || string.IsNullOrWhiteSpace(item.WordOrPhrase) || item.Box < 1 || item.Box > 5 || item.IntervalDays < 0))
        {
            return new BackupImportResult(
                Success: false,
                Message: "Corrupted backup: SRS items collection contains invalid items.",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }

        if (payload.SpeechScores.Any(score => score is null || string.IsNullOrWhiteSpace(score.SessionId) || score.OverallAccuracy < 0 || score.OverallAccuracy > 100))
        {
            return new BackupImportResult(
                Success: false,
                Message: "Corrupted backup: speech scores collection contains invalid records.",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }

        try
        {
            var sessionLogs = payload.Sessions.Select(s => new SessionLog(
                DayNumber: s.DayNumber,
                ScheduledDate: s.ScheduledDate,
                CompletedAt: s.CompletedAt,
                PlannedMinutes: s.PlannedMinutes,
                ActualMinutes: s.ActualMinutes,
                Status: s.Status,
                SelfRating: s.SelfRating,
                LearnerNotes: s.LearnerNotes,
                AiFeedbackSnippet: s.AiFeedbackSnippet
            ));
            var restoredSessions = progressService.RestoreSessions(sessionLogs);

            var restoredSrs = srsService.RestoreItems(payload.SrsItems);

            var drillScores = payload.SpeechScores.Select(d => new DrillScoreRecord(
                SessionId: d.SessionId,
                Timestamp: d.Timestamp,
                DayNumber: d.DayNumber,
                TargetText: d.TargetText,
                OverallAccuracy: d.OverallAccuracy,
                CategoryScores: d.CategoryScores ?? []
            ));
            speechScoringService.RestoreScores(drillScores);

            return new BackupImportResult(
                Success: true,
                Message: $"Successfully restored {restoredSessions} session(s) and {restoredSrs} SRS item(s).",
                RestoredSessionsCount: restoredSessions,
                RestoredSrsItemsCount: restoredSrs
            );
        }
        catch (Exception ex)
        {
            return new BackupImportResult(
                Success: false,
                Message: $"Error restoring backup: {ex.Message}",
                RestoredSessionsCount: 0,
                RestoredSrsItemsCount: 0
            );
        }
    }
}
