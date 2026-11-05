using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface IShadowingService
{
    Task<ShadowingFeedbackResponse> EvaluateShadowingAsync(ShadowingEvaluateRequest request, CancellationToken ct = default);
    Task<ReferenceAudioInfo> GetReferenceInfoAsync(int day, CancellationToken ct = default);
}
