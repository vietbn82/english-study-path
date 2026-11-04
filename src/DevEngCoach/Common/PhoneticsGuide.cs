namespace DevEngCoach.Common;

public sealed record PhoneticsGuide(
    string TargetSound,
    string PhoneticSymbol,
    string ActiveArticulator,
    string PassiveArticulator,
    string MannerOfArticulation,
    bool IsVoiced,
    string MechanicalInstructions,
    string CommonVietnameseMistake,
    string PhysicalCue
);
