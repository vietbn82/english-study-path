using DevEngCoach.Common;
using DevEngCoach.Services;
using FluentAssertions;

namespace DevEngCoach.Tests;

public sealed class SrsServiceTests : IDisposable
{
    private readonly string _testDir;
    private readonly SrsService _srsService;

    public SrsServiceTests()
    {
        _testDir = Path.Combine(Path.GetTempPath(), "DevEngCoach_SrsTest_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(_testDir, "Data"));

        var env = new FakeWebHostEnvironment(_testDir);
        _srsService = new SrsService(env);
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_testDir))
            {
                Directory.Delete(_testDir, true);
            }
        }
        catch
        {
            // Best effort cleanup
        }
    }

    [Fact]
    public void InitialSeed_ShouldContainEightStandardVietnameseWeakSpots()
    {
        var items = _srsService.GetAllItems();

        items.Should().HaveCount(8);
        items.Select(i => i.WordOrPhrase).Should().BeEquivalentTo(
        [
            "throughput",
            "build",
            "commit",
            "cache",
            "architecture",
            "microservices",
            "algorithm",
            "width"
        ]);

        var throughput = items.Single(i => i.WordOrPhrase == "throughput");
        throughput.TargetPhoneme.Should().Contain("/θ/");
        throughput.Box.Should().Be(1);
        throughput.IntervalDays.Should().Be(1);
        throughput.ReviewCount.Should().Be(0);
        throughput.ConsecutiveCorrect.Should().Be(0);

        var jsonPath = Path.Combine(_testDir, "Data", "srs.json");
        File.Exists(jsonPath).Should().BeTrue();
    }

    [Fact]
    public void GetDueItems_Initially_ShouldReturnAllSeededItems()
    {
        var dueItems = _srsService.GetDueItems();

        dueItems.Should().HaveCount(8);
        dueItems.Should().AllSatisfy(item =>
        {
            item.NextReviewDate.Should().BeOnOrBefore(DateTime.UtcNow);
        });
    }

    [Fact]
    public void RecordReview_ScoreAtLeast75_ShouldPromoteItemToBox2WithInterval3Days()
    {
        var initialDue = _srsService.GetDueItems();
        var itemToReview = initialDue.First();

        var updated = _srsService.RecordReview(new SrsReviewRequest(itemToReview.Id, 85));

        updated.Box.Should().Be(2);
        updated.IntervalDays.Should().Be(3);
        updated.ConsecutiveCorrect.Should().Be(1);
        updated.LastScore.Should().Be(85);
        updated.ReviewCount.Should().Be(1);
        updated.NextReviewDate.Should().BeAfter(DateTime.UtcNow.AddDays(2));

        var remainingDue = _srsService.GetDueItems();
        remainingDue.Should().NotContain(i => i.Id == itemToReview.Id);
    }

    [Fact]
    public void RecordReview_FullProgressionToBox5_ShouldCapAtBox5AndInterval30Days()
    {
        var item = _srsService.GetAllItems().First();

        // Box 1 -> Box 2 (Interval 3 days)
        var rev1 = _srsService.RecordReview(new SrsReviewRequest(item.Id, 80));
        rev1.Box.Should().Be(2);
        rev1.IntervalDays.Should().Be(3);
        rev1.ConsecutiveCorrect.Should().Be(1);

        // Box 2 -> Box 3 (Interval 7 days)
        var rev2 = _srsService.RecordReview(new SrsReviewRequest(item.Id, 85));
        rev2.Box.Should().Be(3);
        rev2.IntervalDays.Should().Be(7);
        rev2.ConsecutiveCorrect.Should().Be(2);

        // Box 3 -> Box 4 (Interval 14 days, Mastered)
        var rev3 = _srsService.RecordReview(new SrsReviewRequest(item.Id, 90));
        rev3.Box.Should().Be(4);
        rev3.IntervalDays.Should().Be(14);
        rev3.ConsecutiveCorrect.Should().Be(3);

        // Box 4 -> Box 5 (Interval 30 days)
        var rev4 = _srsService.RecordReview(new SrsReviewRequest(item.Id, 95));
        rev4.Box.Should().Be(5);
        rev4.IntervalDays.Should().Be(30);
        rev4.ConsecutiveCorrect.Should().Be(4);

        // Box 5 stays at Box 5 (Interval 30 days)
        var rev5 = _srsService.RecordReview(new SrsReviewRequest(item.Id, 100));
        rev5.Box.Should().Be(5);
        rev5.IntervalDays.Should().Be(30);
        rev5.ConsecutiveCorrect.Should().Be(5);
        rev5.ReviewCount.Should().Be(5);
    }

    [Fact]
    public void RecordReview_ScoreUnder75_ShouldDemoteToBox1AndResetConsecutiveCorrect()
    {
        var item = _srsService.GetAllItems().First();

        // Advance to Box 3 first
        _srsService.RecordReview(new SrsReviewRequest(item.Id, 85));
        var promoted = _srsService.RecordReview(new SrsReviewRequest(item.Id, 85));
        promoted.Box.Should().Be(3);
        promoted.ConsecutiveCorrect.Should().Be(2);

        // Fail review with score 65 (< 75)
        var demoted = _srsService.RecordReview(new SrsReviewRequest(item.Id, 65));

        demoted.Box.Should().Be(1);
        demoted.IntervalDays.Should().Be(1);
        demoted.ConsecutiveCorrect.Should().Be(0);
        demoted.LastScore.Should().Be(65);
        demoted.ReviewCount.Should().Be(3);
        demoted.NextReviewDate.Should().BeAfter(DateTime.UtcNow.AddHours(23));
    }

    [Fact]
    public void RecordReview_InvalidItemId_ShouldThrowKeyNotFoundException()
    {
        var act = () => _srsService.RecordReview(new SrsReviewRequest("non-existent-id", 80));

        act.Should().Throw<KeyNotFoundException>()
            .WithMessage("*non-existent-id*");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(101)]
    public void RecordReview_ScoreOutOfRange_ShouldThrowArgumentOutOfRangeException(int invalidScore)
    {
        var item = _srsService.GetAllItems().First();

        var act = () => _srsService.RecordReview(new SrsReviewRequest(item.Id, invalidScore));

        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void AutoEnrollWeakSpot_NewWord_ShouldAddToItemsAndBeDueImmediately()
    {
        var request = new SrsEnrollRequest(
            WordOrPhrase: "concurrency",
            TargetPhoneme: "/kənˈkʌr.ən.si/",
            ContextSentence: "Concurrency bugs are hard to reproduce.",
            InitialScore: 60
        );

        var enrolled = _srsService.AutoEnrollWeakSpot(request);

        enrolled.Should().NotBeNull();
        enrolled.Id.Should().NotBeNullOrWhiteSpace();
        enrolled.WordOrPhrase.Should().Be("concurrency");
        enrolled.TargetPhoneme.Should().Be("/kənˈkʌr.ən.si/");
        enrolled.ContextSentence.Should().Be("Concurrency bugs are hard to reproduce.");
        enrolled.Box.Should().Be(1);
        enrolled.IntervalDays.Should().Be(1);
        enrolled.ConsecutiveCorrect.Should().Be(0);
        enrolled.LastScore.Should().Be(60);
        enrolled.ReviewCount.Should().Be(0);
        enrolled.NextReviewDate.Should().BeOnOrBefore(DateTime.UtcNow);

        var allItems = _srsService.GetAllItems();
        allItems.Should().HaveCount(9);
        allItems.Should().Contain(i => i.WordOrPhrase == "concurrency");

        var dueItems = _srsService.GetDueItems();
        dueItems.Should().Contain(i => i.WordOrPhrase == "concurrency");
    }

    [Fact]
    public void AutoEnrollWeakSpot_ExistingWordWithFailingScore_ShouldUpdateAndResetToBox1()
    {
        var item = _srsService.GetAllItems().First(i => i.WordOrPhrase == "commit");

        // Promote commit to Box 2
        _srsService.RecordReview(new SrsReviewRequest(item.Id, 85));

        // Re-enroll with failing initial score
        var reEnrolled = _srsService.AutoEnrollWeakSpot(new SrsEnrollRequest(
            WordOrPhrase: "commit",
            TargetPhoneme: "/t/ - alveolar stop",
            ContextSentence: "Commit your code frequently.",
            InitialScore: 50
        ));

        reEnrolled.Id.Should().Be(item.Id);
        reEnrolled.Box.Should().Be(1);
        reEnrolled.IntervalDays.Should().Be(1);
        reEnrolled.ConsecutiveCorrect.Should().Be(0);
        reEnrolled.LastScore.Should().Be(50);
        reEnrolled.ContextSentence.Should().Be("Commit your code frequently.");

        _srsService.GetAllItems().Should().HaveCount(8, "existing word should not be duplicated");
    }

    [Fact]
    public void AutoEnrollWeakSpot_EmptyWord_ShouldThrowArgumentException()
    {
        var act = () => _srsService.AutoEnrollWeakSpot(new SrsEnrollRequest("", "/t/", "sentence", 50));

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void GetStats_ShouldCalculateMetricsAccurately()
    {
        // Initial state
        var statsInitial = _srsService.GetStats();
        statsInitial.TotalTracked.Should().Be(8);
        statsInitial.DueToday.Should().Be(8);
        statsInitial.Mastered.Should().Be(0);
        statsInitial.AverageScore.Should().Be(0.0);

        var items = _srsService.GetAllItems();

        // Review item 0 to Box 4 (Mastered >= 4)
        var id1 = items[0].Id;
        _srsService.RecordReview(new SrsReviewRequest(id1, 80)); // Box 2
        _srsService.RecordReview(new SrsReviewRequest(id1, 80)); // Box 3
        _srsService.RecordReview(new SrsReviewRequest(id1, 90)); // Box 4 (Mastered)

        // Review item 1 with 70 (Fails, stays Box 1, scheduled tomorrow)
        var id2 = items[1].Id;
        _srsService.RecordReview(new SrsReviewRequest(id2, 70));

        var stats = _srsService.GetStats();
        stats.TotalTracked.Should().Be(8);
        stats.DueToday.Should().Be(6); // 8 - 2 reviewed items (both scheduled in future)
        stats.Mastered.Should().Be(1); // item 0 is at Box 4

        // Scored items are id1 (90) and id2 (70) -> Average = (90 + 70) / 2 = 80.0
        stats.AverageScore.Should().Be(80.0);
    }

    [Fact]
    public void StatePersistence_ShouldReloadPersistedDataInNewServiceInstance()
    {
        var items = _srsService.GetAllItems();
        var item = items.First();

        _srsService.RecordReview(new SrsReviewRequest(item.Id, 92));
        _srsService.AutoEnrollWeakSpot(new SrsEnrollRequest("deadlock", "/k/", "Deadlock in thread pool.", 45));

        // Create a new instance pointing to the same folder using the direct string path constructor
        var secondaryService = new SrsService(_testDir);

        var loadedItems = secondaryService.GetAllItems();
        loadedItems.Should().HaveCount(9);

        var loadedReviewed = loadedItems.Single(i => i.Id == item.Id);
        loadedReviewed.Box.Should().Be(2);
        loadedReviewed.IntervalDays.Should().Be(3);
        loadedReviewed.LastScore.Should().Be(92);
        loadedReviewed.ReviewCount.Should().Be(1);

        var loadedNew = loadedItems.Single(i => i.WordOrPhrase == "deadlock");
        loadedNew.LastScore.Should().Be(45);
        loadedNew.Box.Should().Be(1);
    }
}
