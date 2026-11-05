using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;
using Xunit;

namespace DevEngCoach.Tests;

public class SrsWarmupServiceTests : IDisposable
{
    private readonly string testSrsPath;
    private readonly SrsService srsService;
    private readonly SrsWarmupService warmupService;

    public SrsWarmupServiceTests()
    {
        testSrsPath = Path.Combine(Path.GetTempPath(), $"srs_warmup_{Guid.NewGuid():N}.json");
        srsService = new SrsService(testSrsPath);
        warmupService = new SrsWarmupService(srsService);
    }

    public void Dispose()
    {
        if (File.Exists(testSrsPath)) File.Delete(testSrsPath);
    }

    [Fact]
    public async Task GetWarmupBatch_WhenItemsExist_ShouldReturnAtMost5Items()
    {
        srsService.AutoEnrollWeakSpot(new SrsEnrollRequest("method", "/θ/", "Context 1", 50));
        srsService.AutoEnrollWeakSpot(new SrsEnrollRequest("commit", "/t/", "Context 2", 55));

        var batch = await warmupService.GetWarmupBatchAsync();

        batch.Should().NotBeNull();
        batch.ShouldSkipWarmup.Should().BeFalse();
        batch.Items.Count.Should().BeInRange(1, 5);
        batch.MotivationalCue.Should().Contain("khởi động");
    }

    [Fact]
    public async Task GetWarmupBatch_WhenNoItemsDue_ShouldIndicateSkip()
    {
        // Review all due items with score 100 to push their review date into future
        foreach (var item in srsService.GetDueItems())
        {
            srsService.RecordReview(new SrsReviewRequest(item.Id, 100));
        }

        var batch = await warmupService.GetWarmupBatchAsync();

        batch.ShouldSkipWarmup.Should().BeTrue();
        batch.Items.Should().BeEmpty();
    }
}
