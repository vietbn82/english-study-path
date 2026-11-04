using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;

namespace DevEngCoach.Tests;

public class CurriculumTests
{
    private readonly CurriculumService _curriculumService;

    public CurriculumTests()
    {
        var baseDir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(baseDir, "src", "DevEngCoach")) && Directory.GetParent(baseDir) != null)
        {
            baseDir = Directory.GetParent(baseDir)!.FullName;
        }

        var projectDir = Path.Combine(baseDir, "src", "DevEngCoach");
        var env = new FakeWebHostEnvironment(projectDir);
        _curriculumService = new CurriculumService(env);
    }

    [Fact]
    public void GetAllLessons_ShouldContainExactly90Days()
    {
        var lessons = _curriculumService.GetAllLessons();
        lessons.Should().HaveCount(90);
    }

    [Theory]
    [InlineData(1, 1)]
    [InlineData(30, 1)]
    [InlineData(31, 2)]
    [InlineData(60, 2)]
    [InlineData(61, 3)]
    [InlineData(90, 3)]
    public void GetLessonByDay_ShouldReturnCorrectSprintAndMetadata(int day, int expectedSprint)
    {
        var lesson = _curriculumService.GetLessonByDay(day);

        lesson.Should().NotBeNull();
        lesson!.DayNumber.Should().Be(day);
        lesson.SprintId.Should().Be(expectedSprint);
        lesson.Title.Should().NotBeNullOrWhiteSpace();
        lesson.Phonetics.Should().NotBeNull();
        lesson.Phonetics.TargetSound.Should().NotBeNullOrWhiteSpace();
        lesson.Phonetics.MechanicalInstructions.Should().NotBeNullOrWhiteSpace();
        lesson.VocabularyDrills.Should().NotBeEmpty();
        lesson.SentenceFrames.Should().NotBeEmpty();
        lesson.PracticeTask.Should().NotBeNull();
    }

    [Fact]
    public void EveryDay_MustHaveNonEmptyArticulatoryGuidance()
    {
        var lessons = _curriculumService.GetAllLessons();

        foreach (var lesson in lessons)
        {
            lesson.Phonetics.ActiveArticulator.Should().NotBeNullOrWhiteSpace($"Day {lesson.DayNumber} lacks ActiveArticulator");
            lesson.Phonetics.CommonVietnameseMistake.Should().NotBeNullOrWhiteSpace($"Day {lesson.DayNumber} lacks CommonVietnameseMistake");
            lesson.Phonetics.MechanicalInstructions.Should().NotBeNullOrWhiteSpace($"Day {lesson.DayNumber} lacks MechanicalInstructions");
        }
    }

    [Theory]
    [InlineData(1, 30)]
    [InlineData(2, 30)]
    [InlineData(3, 30)]
    public void GetLessonsBySprint_ShouldReturnExactly30Lessons(int sprintId, int expectedCount)
    {
        var sprintLessons = _curriculumService.GetLessonsBySprint(sprintId);
        sprintLessons.Should().HaveCount(expectedCount);
        sprintLessons.Should().OnlyContain(l => l.SprintId == sprintId);
    }

    [Fact]
    public void AllVocabularyDrills_ShouldHaveIpaAndVietnameseContext()
    {
        var lessons = _curriculumService.GetAllLessons();

        foreach (var lesson in lessons)
        {
            foreach (var drill in lesson.VocabularyDrills)
            {
                drill.Word.Should().NotBeNullOrWhiteSpace();
                drill.Ipa.Should().NotBeNullOrWhiteSpace();
                drill.MeaningVi.Should().NotBeNullOrWhiteSpace();
            }
        }
    }
}
