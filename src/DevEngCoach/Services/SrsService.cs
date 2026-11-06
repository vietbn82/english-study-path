using System.Text.Json;
using DevEngCoach.Common;
using Microsoft.AspNetCore.Hosting;

namespace DevEngCoach.Services;

public interface ISrsService
{
    IReadOnlyList<SrsItem> GetDueItems();
    IReadOnlyList<SrsItem> GetAllItems();
    SrsItem RecordReview(SrsReviewRequest request);
    SrsItem AutoEnrollWeakSpot(SrsEnrollRequest request);
    SrsStats GetStats();
    int RestoreItems(IEnumerable<SrsItem> items);
}

public sealed class SrsService : ISrsService
{
    private readonly string _filePath;
    private readonly object _lock = new();
    private readonly List<SrsItem> _items = [];
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public SrsService(IWebHostEnvironment env)
        : this(env?.ContentRootPath ?? throw new ArgumentNullException(nameof(env)))
    {
    }

    public SrsService(string basePath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(basePath);

        if (basePath.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            _filePath = basePath;
        }
        else if (Path.GetFileName(basePath).Equals("Data", StringComparison.OrdinalIgnoreCase))
        {
            _filePath = Path.Combine(basePath, "srs.json");
        }
        else
        {
            _filePath = Path.Combine(basePath, "Data", "srs.json");
        }

        InitializeData();
    }

    public IReadOnlyList<SrsItem> GetDueItems()
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;
            return _items
                .Where(item => item.NextReviewDate <= now)
                .OrderBy(item => item.NextReviewDate)
                .ToList();
        }
    }

    public IReadOnlyList<SrsItem> GetAllItems()
    {
        lock (_lock)
        {
            return _items.ToList();
        }
    }

    public SrsItem RecordReview(SrsReviewRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.Score is < 1 or > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Score must be between 1 and 100.");
        }

        lock (_lock)
        {
            var index = _items.FindIndex(i => string.Equals(i.Id, request.ItemId, StringComparison.OrdinalIgnoreCase));
            if (index < 0)
            {
                throw new KeyNotFoundException($"SRS item with ID '{request.ItemId}' was not found.");
            }

            var current = _items[index];
            bool isPassing = request.Score >= 75;

            int newBox;
            int newInterval;
            int newConsecutiveCorrect;

            if (isPassing)
            {
                newBox = Math.Min(5, current.Box + 1);
                newInterval = GetIntervalDaysForBox(newBox);
                newConsecutiveCorrect = current.ConsecutiveCorrect + 1;
            }
            else
            {
                newBox = 1;
                newInterval = 1;
                newConsecutiveCorrect = 0;
            }

            var updated = current with
            {
                Box = newBox,
                IntervalDays = newInterval,
                NextReviewDate = DateTime.UtcNow.AddDays(newInterval),
                ConsecutiveCorrect = newConsecutiveCorrect,
                LastScore = request.Score,
                ReviewCount = current.ReviewCount + 1
            };

            _items[index] = updated;
            SaveInternal();
            return updated;
        }
    }

    public SrsItem AutoEnrollWeakSpot(SrsEnrollRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.WordOrPhrase))
        {
            throw new ArgumentException("Word or phrase cannot be empty.", nameof(request));
        }

        var normalizedWord = request.WordOrPhrase.Trim();

        lock (_lock)
        {
            var existingIndex = _items.FindIndex(i =>
                string.Equals(i.WordOrPhrase, normalizedWord, StringComparison.OrdinalIgnoreCase));

            if (existingIndex >= 0)
            {
                var existing = _items[existingIndex];
                var updated = existing with
                {
                    TargetPhoneme = string.IsNullOrWhiteSpace(request.TargetPhoneme) ? existing.TargetPhoneme : request.TargetPhoneme,
                    ContextSentence = string.IsNullOrWhiteSpace(request.ContextSentence) ? existing.ContextSentence : request.ContextSentence,
                    LastScore = request.InitialScore,
                    Box = request.InitialScore < 75 ? 1 : existing.Box,
                    IntervalDays = request.InitialScore < 75 ? 1 : existing.IntervalDays,
                    ConsecutiveCorrect = request.InitialScore < 75 ? 0 : existing.ConsecutiveCorrect,
                    NextReviewDate = DateTime.UtcNow
                };

                _items[existingIndex] = updated;
                SaveInternal();
                return updated;
            }

            var newItem = new SrsItem(
                Id: Guid.NewGuid().ToString("N"),
                WordOrPhrase: normalizedWord,
                TargetPhoneme: request.TargetPhoneme ?? string.Empty,
                ContextSentence: request.ContextSentence ?? string.Empty,
                NextReviewDate: DateTime.UtcNow,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: request.InitialScore,
                ReviewCount: 0
            );

            _items.Add(newItem);
            SaveInternal();
            return newItem;
        }
    }

    public SrsStats GetStats()
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;
            var total = _items.Count;
            var dueToday = _items.Count(item => item.NextReviewDate <= now);
            var mastered = _items.Count(item => item.Box >= 4);

            var scored = _items.Where(i => i.ReviewCount > 0 || i.LastScore > 0).ToList();
            var averageScore = scored.Count > 0
                ? Math.Round(scored.Average(i => (double)i.LastScore), 1)
                : 0.0;

            return new SrsStats(
                TotalTracked: total,
                DueToday: dueToday,
                Mastered: mastered,
                AverageScore: averageScore
            );
        }
    }

    public int RestoreItems(IEnumerable<SrsItem> items)
    {
        ArgumentNullException.ThrowIfNull(items);
        lock (_lock)
        {
            _items.Clear();
            _items.AddRange(items);
            SaveInternal();
            return _items.Count;
        }
    }

    public static int GetIntervalDaysForBox(int box) => box switch
    {
        1 => 1,
        2 => 3,
        3 => 7,
        4 => 14,
        5 => 30,
        _ => 1
    };

    private void InitializeData()
    {
        lock (_lock)
        {
            var directory = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            if (File.Exists(_filePath))
            {
                try
                {
                    var json = File.ReadAllText(_filePath);
                    if (!string.IsNullOrWhiteSpace(json))
                    {
                        var loaded = JsonSerializer.Deserialize<List<SrsItem>>(json, JsonOptions);
                        if (loaded is { Count: > 0 })
                        {
                            _items.Clear();
                            _items.AddRange(loaded);
                            return;
                        }
                    }
                }
                catch (JsonException)
                {
                    // Fall back to seed items if file content is invalid
                }
            }

            _items.Clear();
            _items.AddRange(CreateSeedItems());
            SaveInternal();
        }
    }

    private void SaveInternal()
    {
        var json = JsonSerializer.Serialize(_items, JsonOptions);
        File.WriteAllText(_filePath, json);
    }

    private static List<SrsItem> CreateSeedItems()
    {
        var now = DateTime.UtcNow;
        return
        [
            new(
                Id: "srs-throughput",
                WordOrPhrase: "throughput",
                TargetPhoneme: "/θ/ - dental fricative",
                ContextSentence: "We need to optimize the database query throughput.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-build",
                WordOrPhrase: "build",
                TargetPhoneme: "/d/ - voiced alveolar stop",
                ContextSentence: "The CI/CD build completed without any errors.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-commit",
                WordOrPhrase: "commit",
                TargetPhoneme: "/t/ - voiceless alveolar stop",
                ContextSentence: "Please commit your changes before pushing to main.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-cache",
                WordOrPhrase: "cache",
                TargetPhoneme: "/ʃ/ - voiceless postalveolar fricative",
                ContextSentence: "Invalidate the Redis cache when user data updates.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-architecture",
                WordOrPhrase: "architecture",
                TargetPhoneme: "/k/ + /tʃ/ - cluster & affricate",
                ContextSentence: "The clean architecture pattern separates domain logic from infrastructure.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-microservices",
                WordOrPhrase: "microservices",
                TargetPhoneme: "/s/ vs /z/ - plural sibilants",
                ContextSentence: "Deploying microservices across multiple Kubernetes clusters.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-algorithm",
                WordOrPhrase: "algorithm",
                TargetPhoneme: "/ð/ /m/ - dental & bilabial coda",
                ContextSentence: "The consensus algorithm handles distributed node failures.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            ),
            new(
                Id: "srs-width",
                WordOrPhrase: "width",
                TargetPhoneme: "/dθ/ - cluster",
                ContextSentence: "Adjust the column width in the CSS grid layout.",
                NextReviewDate: now,
                IntervalDays: 1,
                Box: 1,
                ConsecutiveCorrect: 0,
                LastScore: 0,
                ReviewCount: 0
            )
        ];
    }
}
