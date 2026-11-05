using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface ICheatSheetService
{
    SprintCheatSheet GetSprintCheatSheet(int sprintId);
}

public sealed class CheatSheetService(ICurriculumService curriculumService) : ICheatSheetService
{
    public SprintCheatSheet GetSprintCheatSheet(int sprintId)
    {
        var validSprintId = Math.Clamp(sprintId, 1, 3);
        var lessons = curriculumService.GetLessonsBySprint(validSprintId);

        var sprintTitle = validSprintId switch
        {
            1 => "Sprint 1: Sửa Lỗi Cơ Học Phát Âm & Daily Standup",
            2 => "Sprint 2: Connected Speech & Sprint Demo Trình Diễn",
            _ => "Sprint 3: Tranh Biện Kiến Trúc & Giao Tiếp 1-on-1 Chuyên Nghiệp"
        };

        var sprintObjective = validSprintId switch
        {
            1 => "Làm chủ âm đuôi (/t, d, s, z, θ, ð/), báo cáo Standup lưu loát trong 90 giây.",
            2 => "Làm chủ nối âm (Linking), Flap T, Elision và thuyết trình tính năng kỹ thuật.",
            _ => "Bảo vệ quan điểm kỹ thuật, phân tích Trade-off và đàm phán giải pháp với Tech Lead/Client."
        };

        // Extract frames
        var frames = new List<CheatSheetFrameRow>();
        var frameNum = 1;
        var seenPatterns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var lesson in lessons)
        {
            foreach (var frame in lesson.SentenceFrames)
            {
                if (seenPatterns.Add(frame.TemplatePattern))
                {
                    var cat = frame.TemplateName.Contains("Yesterday", StringComparison.OrdinalIgnoreCase) ? "Yesterday" :
                              frame.TemplateName.Contains("Today", StringComparison.OrdinalIgnoreCase) ? "Today" :
                              frame.TemplateName.Contains("Issue", StringComparison.OrdinalIgnoreCase) || frame.TemplateName.Contains("Blocker", StringComparison.OrdinalIgnoreCase) ? "Blockers" :
                              "Architecture & Context";

                    frames.Add(new CheatSheetFrameRow(
                        Number: frameNum++,
                        Category: cat,
                        TemplatePattern: frame.TemplatePattern,
                        TranslationVi: frame.VietnameseTranslation
                    ));
                    if (frames.Count >= 10) break;
                }
            }
            if (frames.Count >= 10) break;
        }

        // Extract phonemes
        var phonemes = new List<CheatSheetPhonemeRow>();
        var seenPhonemes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var lesson in lessons)
        {
            var p = lesson.Phonetics;
            if (seenPhonemes.Add(p.TargetSound))
            {
                var devWords = lesson.VocabularyDrills.Select(v => v.Word).Take(3).ToList();
                phonemes.Add(new CheatSheetPhonemeRow(
                    Symbol: p.TargetSound,
                    SoundName: p.MannerOfArticulation,
                    MouthPlacementCueVi: p.PhysicalCue,
                    DevWords: devWords
                ));
            }
        }

        // Extract vocabulary
        var vocab = new List<CheatSheetWordRow>();
        var seenWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var lesson in lessons)
        {
            foreach (var v in lesson.VocabularyDrills)
            {
                if (seenWords.Add(v.Word))
                {
                    vocab.Add(new CheatSheetWordRow(
                        Word: v.Word,
                        Ipa: v.Ipa,
                        MeaningVi: v.MeaningVi,
                        Cue: v.PhysicalNote
                    ));
                    if (vocab.Count >= 20) break;
                }
            }
            if (vocab.Count >= 20) break;
        }

        return new SprintCheatSheet(
            SprintId: validSprintId,
            SprintTitle: sprintTitle,
            FocusObjective: sprintObjective,
            SentenceFrames: frames,
            TargetPhonemes: phonemes,
            EssentialVocabulary: vocab
        );
    }
}
