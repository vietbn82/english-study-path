namespace DevEngCoach.Common;

public sealed record IpaTooltipData(
    string Symbol,
    string SoundCategory,
    string VietnameseEquivalent,
    string PhysicalCueVi,
    IReadOnlyList<string> DevExampleWords,
    string CommonMistake
);
