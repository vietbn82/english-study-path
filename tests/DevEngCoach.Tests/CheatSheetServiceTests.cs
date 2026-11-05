using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class CheatSheetServiceTests
{
    private readonly CurriculumService curriculumService;
    private readonly CheatSheetService cheatSheetService;

    public CheatSheetServiceTests()
    {
        var baseDir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(baseDir, "src", "DevEngCoach")) && Directory.GetParent(baseDir) != null)
        {
            baseDir = Directory.GetParent(baseDir)!.FullName;
        }
        var projectDir = Path.Combine(baseDir, "src", "DevEngCoach");
        var env = new FakeWebHostEnvironment(projectDir);

        curriculumService = new CurriculumService(env);
        cheatSheetService = new CheatSheetService(curriculumService);
    }

    [Fact]
    public void GetSprintCheatSheet_ForSprint1_ShouldReturnDenseStructuredOnePager()
    {
        var sheet = cheatSheetService.GetSprintCheatSheet(1);

        sheet.Should().NotBeNull();
        sheet.SprintId.Should().Be(1);
        sheet.SentenceFrames.Should().NotBeEmpty();
        sheet.TargetPhonemes.Should().NotBeEmpty();
        sheet.EssentialVocabulary.Should().NotBeEmpty();
    }
}
