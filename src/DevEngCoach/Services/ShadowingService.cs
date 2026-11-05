using DevEngCoach.Common;
using Microsoft.Extensions.Logging;

namespace DevEngCoach.Services;

public sealed class ShadowingService(ICurriculumService curriculumService) : IShadowingService
{
    public Task<ShadowingFeedbackResponse> EvaluateShadowingAsync(ShadowingEvaluateRequest request, CancellationToken ct = default)
    {
        var refDuration = request.ReferenceDurationSeconds > 0 ? request.ReferenceDurationSeconds : 3.0;
        var userDuration = request.UserDurationSeconds > 0 ? request.UserDurationSeconds : refDuration;
        var speedRatio = Math.Round(userDuration / refDuration, 2);

        string diagnosis;
        int pacingScore;
        string stressTimingTip;
        var alerts = new List<string>();

        if (speedRatio < 0.8)
        {
            diagnosis = "Rushed (Nói quá vội)";
            pacingScore = Math.Clamp((int)(100 - (0.8 - speedRatio) * 120), 40, 75);
            stressTimingTip = "Bạn đang nói dồn dập (Syllable-timed). Hãy ngắt hơi tại các ranh giới mệnh đề, kéo dài nguyên âm ở các từ khóa (Content words) như danh từ và động từ chính.";
            alerts.Add("Tốc độ quá nhanh dễ dẫn đến nuốt âm đuôi và làm mất độ nổ của phụ âm bật hơi.");
        }
        else if (speedRatio > 1.25)
        {
            diagnosis = "Lagging (Nói rời rạc / Ngập ngừng)";
            pacingScore = Math.Clamp((int)(100 - (speedRatio - 1.25) * 100), 40, 75);
            stressTimingTip = "Thời gian nói kéo dài do ngập ngừng ngắt quãng. Hãy nối âm (Linking) từ phụ âm đuôi của từ trước sang nguyên âm đầu của từ sau.";
            alerts.Add("Tập dứt khoát không ngậm miệng lại quá lâu giữa các từ.");
        }
        else
        {
            diagnosis = "Optimal (Tốc độ & Nhịp điệu lý tưởng)";
            pacingScore = Math.Clamp((int)(100 - Math.Abs(speedRatio - 1.0) * 80), 85, 100);
            stressTimingTip = "Nhịp điệu tự nhiên, duy trì khoảng nghỉ chuẩn xác và đạt độ tương thích cao với câu mẫu.";
        }

        // Check for common ending consonants in target sentence
        var targetLower = (request.TargetSentence ?? string.Empty).ToLowerInvariant();
        if (targetLower.Contains("ed ") || targetLower.EndsWith("ed"))
        {
            alerts.Add("Kiểm tra âm đuôi -ed: Đảm bảo có tiếng bật hơi hoặc rung rõ ràng.");
        }
        if (targetLower.Contains("th"))
        {
            alerts.Add("Kiểm tra âm /θ/ hoặc /ð/: Lưỡi đặt nhẹ giữa 2 hàm răng, không giật thụt vào trong.");
        }

        var recommendation = pacingScore >= 80
            ? "Tuyệt vời! Hãy tiếp tục luyện tập câu tiếp theo để củng cố phản xạ cơ miệng."
            : "Khuyên nghị: Nghe lại câu mẫu 1 lần bằng nút Back-to-Back, chú ý nhịp vung tay theo trọng âm rồi thu âm lại.";

        return Task.FromResult(new ShadowingFeedbackResponse(
            PacingScore: pacingScore,
            PacingDiagnosis: diagnosis,
            SpeedRatio: speedRatio,
            StressTimingTip: stressTimingTip,
            ArticulatoryAlerts: alerts,
            ActionableRecommendation: recommendation
        ));
    }

    public Task<ReferenceAudioInfo> GetReferenceInfoAsync(int day, CancellationToken ct = default)
    {
        var lesson = curriculumService.GetLessonByDay(day)
            ?? curriculumService.GetLessonByDay(1)!;

        var sentence = lesson.SentenceFrames.Count > 0
            ? lesson.SentenceFrames[0].TemplatePattern
            : "Yesterday, I focused on the deployment pipeline.";

        // Word count estimate (approx 2.3 words/sec)
        var wordCount = sentence.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        var estDuration = Math.Round(Math.Max(2.0, wordCount / 2.3), 1);

        return Task.FromResult(new ReferenceAudioInfo(
            DayNumber: lesson.DayNumber,
            SentenceFrame: sentence,
            PhoneticGuide: lesson.Phonetics.TargetSound,
            TargetDurationSeconds: estDuration,
            AudioMode: "TTS"
        ));
    }
}
