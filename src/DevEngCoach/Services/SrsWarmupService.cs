using DevEngCoach.Common;

namespace DevEngCoach.Services;

public interface ISrsWarmupService
{
    Task<SrsWarmupBatch> GetWarmupBatchAsync(CancellationToken ct = default);
}

public sealed class SrsWarmupService(ISrsService srsService) : ISrsWarmupService
{
    public Task<SrsWarmupBatch> GetWarmupBatchAsync(CancellationToken ct = default)
    {
        var dueItems = srsService.GetDueItems();

        if (dueItems.Count == 0)
        {
            return Task.FromResult(new SrsWarmupBatch(
                Items: [],
                TotalDueInSrs: 0,
                ShouldSkipWarmup: true,
                MotivationalCue: "Không có từ nào đến hạn ôn tập hôm nay. Vào thẳng bài học mới! 🚀"
            ));
        }

        // Weighted selection: Box 1 (weakest), then Box 2, then higher boxes
        var selected = new List<SrsItem>();

        var box1Items = dueItems.Where(i => i.Box == 1).Take(3).ToList();
        selected.AddRange(box1Items);

        var box2Items = dueItems.Where(i => i.Box == 2 && !selected.Contains(i)).Take(1).ToList();
        selected.AddRange(box2Items);

        var higherBoxItems = dueItems.Where(i => i.Box >= 3 && !selected.Contains(i)).Take(1).ToList();
        selected.AddRange(higherBoxItems);

        // Fill remaining if needed up to 5
        if (selected.Count < 5)
        {
            var remaining = dueItems.Where(i => !selected.Contains(i)).Take(5 - selected.Count).ToList();
            selected.AddRange(remaining);
        }

        var warmupItems = selected.Select(s => new SrsWarmupItem(
            ItemId: s.Id,
            WordOrPhrase: s.WordOrPhrase,
            TargetPhoneme: s.TargetPhoneme,
            ContextSentence: s.ContextSentence,
            Box: s.Box,
            CueNote: $"Hộp {s.Box} // Điểm gần nhất: {s.LastScore}/100"
        )).ToList();

        return Task.FromResult(new SrsWarmupBatch(
            Items: warmupItems,
            TotalDueInSrs: dueItems.Count,
            ShouldSkipWarmup: false,
            MotivationalCue: "2 phút khởi động nhanh cơ miệng với các từ hay vấp trước khi vào bài mới! 🎯"
        ));
    }
}
