using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class IpaGlossaryTests
{
    private readonly IpaGlossaryService glossaryService = new();

    [Fact]
    public void GetAll_ShouldReturnCommonIpaSymbols()
    {
        var all = glossaryService.GetAll();

        all.Should().NotBeEmpty();
        all.Should().ContainKey("/θ/");
        all.Should().ContainKey("/t/");
        all.Should().ContainKey("/ʃ/");
    }

    [Fact]
    public void Lookup_WhenSymbolProvided_ShouldReturnPlainLanguageExplanation()
    {
        var data = glossaryService.Lookup("/θ/");

        data.Should().NotBeNull();
        data!.PhysicalCueVi.Should().Contain("răng");
        data.DevExampleWords.Should().Contain("auth");
    }
}
