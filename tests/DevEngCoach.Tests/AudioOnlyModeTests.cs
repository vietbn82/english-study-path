using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public sealed class AudioOnlyModeTests : IDisposable
{
    private readonly string _testDir;
    private readonly FakeWebHostEnvironment _env;
    private readonly ProgressService _progressService;

    public AudioOnlyModeTests()
    {
        _testDir = Path.Combine(Path.GetTempPath(), "DevEngCoach_AudioOnly_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(_testDir, "Data"));
        _env = new FakeWebHostEnvironment(_testDir);
        _progressService = new ProgressService(_env);
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_testDir))
            {
                Directory.Delete(_testDir, true);
            }
        }
        catch
        {
            // Ignore cleanup failure in temp directory
        }
    }

    [Fact]
    public void CompleteSession_WithAudioOnlyMode_SavesAndRetrievesSessionModeProperly()
    {
        // Arrange
        var request = new CompleteSessionRequest(
            DayNumber: 7,
            ActualMinutes: 20,
            SelfRating: 5,
            LearnerNotes: "Late night eyes-free practice",
            AiFeedbackSnippet: null,
            SessionMode: "AudioOnly"
        );

        // Act
        var completed = _progressService.CompleteSession(request);

        // Assert in-memory returned session
        completed.Should().NotBeNull();
        completed.DayNumber.Should().Be(7);
        completed.SessionMode.Should().Be("AudioOnly");
        completed.Status.Should().Be("Completed");

        // Assert GetSessionByDay retrieves it
        var retrieved = _progressService.GetSessionByDay(7);
        retrieved.Should().NotBeNull();
        retrieved!.SessionMode.Should().Be("AudioOnly");
    }

    [Fact]
    public void CompleteSession_WithAudioOnlyMode_PersistsToDiskAndLoadsCorrectly()
    {
        // Arrange
        var request = new CompleteSessionRequest(
            DayNumber: 15,
            ActualMinutes: 25,
            SelfRating: 4,
            LearnerNotes: "Audio-only session with eyes closed",
            AiFeedbackSnippet: null,
            SessionMode: "AudioOnly"
        );

        _progressService.CompleteSession(request);

        // Act - reload a new ProgressService instance pointing to the same file path
        var reloadedService = new ProgressService(_env);
        var loadedSession = reloadedService.GetSessionByDay(15);

        // Assert
        loadedSession.Should().NotBeNull();
        loadedSession!.DayNumber.Should().Be(15);
        loadedSession.SessionMode.Should().Be("AudioOnly");
        loadedSession.Status.Should().Be("Completed");
        loadedSession.ActualMinutes.Should().Be(25);
    }

    [Fact]
    public void CompleteSession_DefaultSessionMode_DefaultsToVisual()
    {
        // Arrange
        var request = new CompleteSessionRequest(
            DayNumber: 2,
            ActualMinutes: 30,
            SelfRating: 5,
            LearnerNotes: "Standard visual dashboard session",
            AiFeedbackSnippet: null
        );

        // Act
        var completed = _progressService.CompleteSession(request);

        // Assert
        completed.SessionMode.Should().Be("Visual");

        var retrieved = _progressService.GetSessionByDay(2);
        retrieved.Should().NotBeNull();
        retrieved!.SessionMode.Should().Be("Visual");
    }

    [Fact]
    public void SessionRecord_ModelDefinition_DefaultsToVisualAndPreservesValue()
    {
        // Act & Assert default constructor
        var recordDefault = new SessionRecord(
            DayNumber: 10,
            ScheduledDate: DateTime.UtcNow,
            CompletedAt: DateTime.UtcNow,
            PlannedMinutes: 30,
            ActualMinutes: 30,
            Status: "Completed"
        );
        recordDefault.SessionMode.Should().Be("Visual");

        // Act & Assert explicit AudioOnly mode
        var recordAudio = new SessionRecord(
            DayNumber: 11,
            ScheduledDate: DateTime.UtcNow,
            CompletedAt: DateTime.UtcNow,
            PlannedMinutes: 30,
            ActualMinutes: 20,
            Status: "Completed",
            SessionMode: "AudioOnly"
        );
        recordAudio.SessionMode.Should().Be("AudioOnly");
    }

    [Fact]
    public void CompleteSessionRequest_ModelDefinition_DefaultsToVisualAndPreservesValue()
    {
        var defaultReq = new CompleteSessionRequest(1, 30, 5, null, null);
        defaultReq.SessionMode.Should().Be("Visual");

        var audioReq = new CompleteSessionRequest(1, 20, 5, null, null, "AudioOnly");
        audioReq.SessionMode.Should().Be("AudioOnly");
    }
}
