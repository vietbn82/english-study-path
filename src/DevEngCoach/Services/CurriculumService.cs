using System.Text.Json;
using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface ICurriculumService
{
    IReadOnlyList<Lesson> GetAllLessons();
    Lesson? GetLessonByDay(int dayNumber);
    IReadOnlyList<Lesson> GetLessonsBySprint(int sprintId);
    QuickLookupResponse? LookupWordInCurriculum(string text);
}

public sealed class CurriculumService : ICurriculumService
{
    private readonly IReadOnlyList<Lesson> _lessons;
    private readonly Dictionary<int, Lesson> _dayIndex;
    private readonly Dictionary<string, (string Ipa, string MeaningVi, string PhysicalNote)> _wordIndex = new(StringComparer.OrdinalIgnoreCase);

    public CurriculumService(IWebHostEnvironment env)
    {
        var dataPath = Path.Combine(env.ContentRootPath, "Data", "curriculum.json");
        if (!File.Exists(dataPath))
        {
            throw new FileNotFoundException($"Curriculum file not found at: {dataPath}");
        }

        var json = File.ReadAllText(dataPath);
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var loaded = JsonSerializer.Deserialize<List<Lesson>>(json, options)
                     ?? throw new InvalidOperationException("Failed to deserialize curriculum data.");

        _lessons = loaded.OrderBy(l => l.DayNumber).ToList();
        _dayIndex = _lessons.ToDictionary(l => l.DayNumber);

        // Index all vocabulary drills across all 90 days for 0ms quick lookup
        foreach (var lesson in _lessons)
        {
            foreach (var drill in lesson.VocabularyDrills)
            {
                if (!string.IsNullOrWhiteSpace(drill.Word))
                {
                    _wordIndex.TryAdd(drill.Word.Trim(), (drill.Ipa, drill.MeaningVi, drill.PhysicalNote));
                }
            }
        }
    }

    public IReadOnlyList<Lesson> GetAllLessons() => _lessons;

    public Lesson? GetLessonByDay(int dayNumber) =>
        _dayIndex.GetValueOrDefault(dayNumber);

    public IReadOnlyList<Lesson> GetLessonsBySprint(int sprintId) =>
        _lessons.Where(l => l.SprintId == sprintId).ToList();

    public QuickLookupResponse? LookupWordInCurriculum(string text)
    {
        var cleaned = text.Trim();
        if (_wordIndex.TryGetValue(cleaned, out var match))
        {
            return new QuickLookupResponse(
                Success: true,
                Text: cleaned,
                Ipa: match.Ipa,
                MeaningVi: match.MeaningVi,
                PhoneticCue: match.PhysicalNote
            );
        }

        // Check if query is inside a compound word or sentence
        var lower = cleaned.ToLowerInvariant();
        var partial = _wordIndex.FirstOrDefault(kvp => kvp.Key.Equals(lower, StringComparison.OrdinalIgnoreCase) || lower.Contains(kvp.Key.ToLowerInvariant()));
        if (!string.IsNullOrEmpty(partial.Key))
        {
            return new QuickLookupResponse(
                Success: true,
                Text: cleaned,
                Ipa: partial.Value.Ipa,
                MeaningVi: partial.Value.MeaningVi,
                PhoneticCue: partial.Value.PhysicalNote
            );
        }

        return null;
    }
}
