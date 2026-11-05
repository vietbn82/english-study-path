using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class MouthMapServiceTests
{
    private readonly MouthMapService mouthMapService = new();

    [Fact]
    public void GetAllEntries_ShouldReturnCoreVietnameseInterferencePhonemes()
    {
        var entries = mouthMapService.GetAllEntries();

        entries.Should().NotBeEmpty();
        entries.Should().Contain(e => e.Phoneme == "/t/");
        entries.Should().Contain(e => e.Phoneme == "/θ/");
        entries.Should().Contain(e => e.Phoneme == "/ʃ/");
    }

    [Fact]
    public void GetEntry_WhenPhonemeFound_ShouldReturnDetailedContrastiveData()
    {
        var entry = mouthMapService.GetEntry("/θ/");

        entry.Should().NotBeNull();
        entry!.VietnameseHabitTitle.Should().Contain("Việt");
        entry.EnglishTargetTitle.Should().Contain("Anh");
        entry.CommonMistakeAlertVi.Should().Contain("Lỗi phổ biến");
        entry.DevExampleWords.Should().Contain("auth");
    }
}
