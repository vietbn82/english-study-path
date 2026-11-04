using System.Text.Json;
using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IProgressService
{
    ProgressSummary GetSummary();
    IReadOnlyList<SessionLog> GetAllSessions();
    SessionLog? GetSessionByDay(int dayNumber);
    SessionLog CompleteSession(CompleteSessionRequest request);
    void ResetProgress();
}

public sealed class ProgressService : IProgressService
{
    private readonly string _filePath;
    private readonly object _lock = new();
    private ProgressFileModel _state;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public ProgressService(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "Data", "progress.json");
        lock (_lock)
        {
            if (File.Exists(_filePath))
            {
                var content = File.ReadAllText(_filePath);
                _state = JsonSerializer.Deserialize<ProgressFileModel>(content, _jsonOptions)
                         ?? CreateDefaultState();
            }
            else
            {
                _state = CreateDefaultState();
                SaveStateInternal();
            }
        }
    }

    public ProgressSummary GetSummary()
    {
        lock (_lock)
        {
            var completedSessions = _state.Sessions
                .Where(s => s.Status == "Completed" && s.CompletedAt.HasValue)
                .OrderBy(s => s.DayNumber)
                .ToList();

            var totalCompleted = completedSessions.Count;
            var totalActualMinutes = completedSessions.Sum(s => s.ActualMinutes);
            var totalPlannedMinutes = totalCompleted * 30;
            var varianceMinutes = totalActualMinutes - totalPlannedMinutes;

            var currentStreak = CalculateCurrentStreak(completedSessions);
            var longestStreak = CalculateLongestStreak(completedSessions);

            var nextDay = 1;
            while (nextDay <= 90 && _state.Sessions.Any(s => s.DayNumber == nextDay && s.Status == "Completed"))
            {
                nextDay++;
            }

            var completionPercentage = Math.Round((double)totalCompleted / 90 * 100, 1);

            return new ProgressSummary(
                CurrentStreakDays: currentStreak,
                LongestStreakDays: longestStreak,
                TotalCompletedDays: totalCompleted,
                TotalPlannedDays: 90,
                TotalActualMinutesSpent: totalActualMinutes,
                TotalPlannedMinutesExpected: totalPlannedMinutes,
                VarianceMinutes: varianceMinutes,
                CompletionPercentage: completionPercentage,
                NextDayNumber: Math.Min(nextDay, 90)
            );
        }
    }

    public IReadOnlyList<SessionLog> GetAllSessions()
    {
        lock (_lock)
        {
            return _state.Sessions.ToList();
        }
    }

    public SessionLog? GetSessionByDay(int dayNumber)
    {
        lock (_lock)
        {
            return _state.Sessions.FirstOrDefault(s => s.DayNumber == dayNumber);
        }
    }

    public SessionLog CompleteSession(CompleteSessionRequest request)
    {
        lock (_lock)
        {
            var existingIndex = _state.Sessions.FindIndex(s => s.DayNumber == request.DayNumber);
            var now = DateTime.Now;

            var log = new SessionLog(
                DayNumber: request.DayNumber,
                ScheduledDate: existingIndex >= 0 ? _state.Sessions[existingIndex].ScheduledDate : now.Date.AddHours(22),
                CompletedAt: now,
                PlannedMinutes: 30,
                ActualMinutes: Math.Max(1, request.ActualMinutes),
                Status: "Completed",
                SelfRating: request.SelfRating ?? 5,
                LearnerNotes: request.LearnerNotes,
                AiFeedbackSnippet: request.AiFeedbackSnippet
            );

            if (existingIndex >= 0)
            {
                _state.Sessions[existingIndex] = log;
            }
            else
            {
                _state.Sessions.Add(log);
            }

            SaveStateInternal();
            return log;
        }
    }

    public void ResetProgress()
    {
        lock (_lock)
        {
            _state = CreateDefaultState();
            SaveStateInternal();
        }
    }

    private void SaveStateInternal()
    {
        var json = JsonSerializer.Serialize(_state, _jsonOptions);
        File.WriteAllText(_filePath, json);
    }

    private static ProgressFileModel CreateDefaultState() => new()
    {
        TargetTime = "22:00",
        DailyPlannedMinutes = 30,
        StartDate = DateTime.Now.ToString("yyyy-MM-dd"),
        Sessions = new List<SessionLog>()
    };

    private static int CalculateCurrentStreak(List<SessionLog> completedSessions)
    {
        if (completedSessions.Count == 0) return 0;

        var dates = completedSessions
            .Where(s => s.CompletedAt.HasValue)
            .Select(s => s.CompletedAt!.Value.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        if (dates.Count == 0) return 0;

        var today = DateTime.Today;
        if (dates[0] != today && dates[0] != today.AddDays(-1))
        {
            return 0; // Streak broken if not done today or yesterday
        }

        var streak = 1;
        for (var i = 1; i < dates.Count; i++)
        {
            if (dates[i - 1].AddDays(-1) == dates[i])
            {
                streak++;
            }
            else
            {
                break;
            }
        }
        return streak;
    }

    private static int CalculateLongestStreak(List<SessionLog> completedSessions)
    {
        if (completedSessions.Count == 0) return 0;

        var dates = completedSessions
            .Where(s => s.CompletedAt.HasValue)
            .Select(s => s.CompletedAt!.Value.Date)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        if (dates.Count == 0) return 0;

        var maxStreak = 1;
        var current = 1;

        for (var i = 1; i < dates.Count; i++)
        {
            if (dates[i - 1].AddDays(1) == dates[i])
            {
                current++;
                if (current > maxStreak) maxStreak = current;
            }
            else
            {
                current = 1;
            }
        }
        return maxStreak;
    }
}

public sealed class ProgressFileModel
{
    public string TargetTime { get; set; } = "22:00";
    public int DailyPlannedMinutes { get; set; } = 30;
    public string StartDate { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public List<SessionLog> Sessions { get; set; } = new();
}
