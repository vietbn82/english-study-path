using System.Text.Json;
using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface ICurriculumService
{
    IReadOnlyList<Lesson> GetAllLessons();
    Lesson? GetLessonByDay(int dayNumber);
    IReadOnlyList<Lesson> GetLessonsBySprint(int sprintId);
}

public sealed class CurriculumService : ICurriculumService
{
    private readonly IReadOnlyList<Lesson> _lessons;
    private readonly Dictionary<int, Lesson> _dayIndex;

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
    }

    public IReadOnlyList<Lesson> GetAllLessons() => _lessons;

    public Lesson? GetLessonByDay(int dayNumber) =>
        _dayIndex.GetValueOrDefault(dayNumber);

    public IReadOnlyList<Lesson> GetLessonsBySprint(int sprintId) =>
        _lessons.Where(l => l.SprintId == sprintId).ToList();
}
