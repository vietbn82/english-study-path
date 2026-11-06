using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DevEngCoach.Tests;

public sealed class BackupServiceTests : IDisposable
{
    private readonly string _testProgressDir;
    private readonly string _testSrsPath;
    private readonly string _testSpeechPath;
    private readonly ProgressService _progressService;
    private readonly SrsService _srsService;
    private readonly SpeechScoringService _speechScoringService;
    private readonly BackupService _backupService;

    public BackupServiceTests()
    {
        _testProgressDir = Path.Combine(Path.GetTempPath(), "DevEngCoach_BackupProgress_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(_testProgressDir, "Data"));

        _testSrsPath = Path.Combine(Path.GetTempPath(), $"srs_backup_{Guid.NewGuid():N}.json");
        _testSpeechPath = Path.Combine(Path.GetTempPath(), $"speech_backup_{Guid.NewGuid():N}.json");

        var progressEnv = new FakeWebHostEnvironment(_testProgressDir);
        _progressService = new ProgressService(progressEnv);
        _srsService = new SrsService(_testSrsPath);

        var projectDir = GetProjectDir();
        var curriculumEnv = new FakeWebHostEnvironment(projectDir);
        var curriculumService = new CurriculumService(curriculumEnv);
        _speechScoringService = new SpeechScoringService(
            _srsService,
            curriculumService,
            NullLogger<SpeechScoringService>.Instance,
            _testSpeechPath
        );

        _backupService = new BackupService(_progressService, _srsService, _speechScoringService);
    }

    private static string GetProjectDir()
    {
        var baseDir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(baseDir, "src", "DevEngCoach")) && Directory.GetParent(baseDir) != null)
        {
            baseDir = Directory.GetParent(baseDir)!.FullName;
        }
        return Path.Combine(baseDir, "src", "DevEngCoach");
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_testProgressDir))
            {
                Directory.Delete(_testProgressDir, true);
            }
            if (File.Exists(_testSrsPath))
            {
                File.Delete(_testSrsPath);
            }
            if (File.Exists(_testSpeechPath))
            {
                File.Delete(_testSpeechPath);
            }
        }
        catch
        {
            // Ignore cleanup failures in test temp folders
        }
    }

    [Fact]
    public void GetFullBackup_ReturnsNonNullStateFromServices()
    {
        // Act
        var backup = _backupService.GetFullBackup();

        // Assert
        backup.Should().NotBeNull();
        backup.Version.Should().Be(1);
        backup.ExportedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        backup.Progress.Should().NotBeNull();
        backup.Sessions.Should().NotBeNull();
        backup.SrsItems.Should().NotBeNull();
        backup.SpeechScores.Should().NotBeNull();
    }

    [Fact]
    public void ImportBackup_WithValidData_RestoresAndReturnsSuccess()
    {
        // Arrange
        var testDate = new DateTime(2026, 11, 6, 12, 0, 0, DateTimeKind.Utc);
        var sampleSession = new SessionRecord(
            DayNumber: 42,
            ScheduledDate: testDate,
            CompletedAt: testDate.AddMinutes(30),
            PlannedMinutes: 30,
            ActualMinutes: 32,
            Status: "Completed",
            SelfRating: 5,
            LearnerNotes: "Clean architecture backup restored successfully.",
            AiFeedbackSnippet: "Perfect articulation."
        );

        var sampleSrsItem = new SrsItem(
            Id: "srs-custom-123",
            WordOrPhrase: "architecture",
            TargetPhoneme: "/k/",
            ContextSentence: "We adopt clean architecture.",
            NextReviewDate: testDate.AddDays(3),
            IntervalDays: 3,
            Box: 2,
            ConsecutiveCorrect: 2,
            LastScore: 95,
            ReviewCount: 2
        );

        var sampleScore = new SpeechScoreRecord(
            SessionId: "session-abc-123",
            Timestamp: testDate,
            DayNumber: 42,
            TargetText: "architecture",
            OverallAccuracy: 95,
            CategoryScores: new List<CategoryScore>
            {
                new(PhonemeCategory.EndingConsonant, 2, 2, 100)
            }
        );

        var validPayload = new BackupPayload(
            Version: 1,
            ExportedAt: testDate,
            Progress: new UserProgressSummary(
                CurrentStreakDays: 5,
                LongestStreakDays: 10,
                TotalCompletedDays: 15,
                TotalPlannedDays: 90,
                TotalActualMinutesSpent: 450,
                TotalPlannedMinutesExpected: 450,
                VarianceMinutes: 0,
                CompletionPercentage: 16.7,
                NextDayNumber: 43
            ),
            Sessions: new List<SessionRecord> { sampleSession },
            SrsItems: new List<SrsItem> { sampleSrsItem },
            SpeechScores: new List<SpeechScoreRecord> { sampleScore }
        );

        // Act
        var result = _backupService.ImportBackup(validPayload);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.RestoredSessionsCount.Should().Be(1);
        result.RestoredSrsItemsCount.Should().Be(1);
        result.Message.Should().Contain("Successfully restored");

        var restoredSessions = _progressService.GetAllSessions();
        restoredSessions.Should().ContainSingle(s => s.DayNumber == 42 && s.Status == "Completed");

        var restoredSrs = _srsService.GetAllItems();
        restoredSrs.Should().Contain(i => i.Id == "srs-custom-123" && i.WordOrPhrase == "architecture");
    }

    [Fact]
    public void ImportBackup_WithNullPayload_FailsGracefullyWithoutException()
    {
        // Act
        var result = _backupService.ImportBackup(null!);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("null");
        result.RestoredSessionsCount.Should().Be(0);
        result.RestoredSrsItemsCount.Should().Be(0);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(2)]
    [InlineData(99)]
    public void ImportBackup_WithInvalidVersion_FailsGracefully(int invalidVersion)
    {
        // Arrange
        var payload = new BackupPayload(
            Version: invalidVersion,
            ExportedAt: DateTime.UtcNow,
            Progress: new UserProgressSummary(),
            Sessions: [],
            SrsItems: [],
            SpeechScores: []
        );

        // Act
        var result = _backupService.ImportBackup(payload);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Unsupported backup version");
    }

    [Fact]
    public void ImportBackup_WithNullCollections_FailsGracefully()
    {
        // Arrange
        var payload = new BackupPayload(
            Version: 1,
            ExportedAt: DateTime.UtcNow,
            Progress: new UserProgressSummary(),
            Sessions: null!,
            SrsItems: [],
            SpeechScores: []
        );

        // Act
        var result = _backupService.ImportBackup(payload);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Corrupted backup");
    }

    [Fact]
    public void ImportBackup_WithCorruptedSessionRecord_FailsGracefully()
    {
        // Arrange
        var invalidSession = new SessionRecord(
            DayNumber: -1, // invalid day
            ScheduledDate: DateTime.UtcNow,
            CompletedAt: null,
            PlannedMinutes: -10, // invalid minutes
            ActualMinutes: 0,
            Status: "" // empty status
        );

        var payload = new BackupPayload(
            Version: 1,
            ExportedAt: DateTime.UtcNow,
            Progress: new UserProgressSummary(),
            Sessions: [invalidSession],
            SrsItems: [],
            SpeechScores: []
        );

        // Act
        var result = _backupService.ImportBackup(payload);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("sessions collection contains invalid records");
    }

    [Fact]
    public void ImportBackup_WithCorruptedSrsItem_FailsGracefully()
    {
        // Arrange
        var invalidSrsItem = new SrsItem(
            Id: "", // invalid empty Id
            WordOrPhrase: "",
            TargetPhoneme: "",
            ContextSentence: "",
            NextReviewDate: DateTime.UtcNow,
            IntervalDays: -1,
            Box: 10, // invalid box > 5
            ConsecutiveCorrect: 0,
            LastScore: 0,
            ReviewCount: 0
        );

        var payload = new BackupPayload(
            Version: 1,
            ExportedAt: DateTime.UtcNow,
            Progress: new UserProgressSummary(),
            Sessions: [],
            SrsItems: [invalidSrsItem],
            SpeechScores: []
        );

        // Act
        var result = _backupService.ImportBackup(payload);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("SRS items collection contains invalid items");
    }

    [Fact]
    public void ImportBackup_WithCorruptedSpeechScore_FailsGracefully()
    {
        // Arrange
        var invalidScore = new SpeechScoreRecord(
            SessionId: "",
            Timestamp: DateTime.UtcNow,
            DayNumber: 1,
            TargetText: "test",
            OverallAccuracy: 150 // invalid accuracy > 100
        );

        var payload = new BackupPayload(
            Version: 1,
            ExportedAt: DateTime.UtcNow,
            Progress: new UserProgressSummary(),
            Sessions: [],
            SrsItems: [],
            SpeechScores: [invalidScore]
        );

        // Act
        var result = _backupService.ImportBackup(payload);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("speech scores collection contains invalid records");
    }
}
