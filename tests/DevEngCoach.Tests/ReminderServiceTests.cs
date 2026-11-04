using DevEngCoach.Services;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace DevEngCoach.Tests;

public class ReminderServiceTests
{
    [Fact]
    public void ReminderService_ShouldTarget22HoursAndBeActive()
    {
        var services = new ServiceCollection();
        var sp = services.BuildServiceProvider();

        var reminder = new ReminderService(NullLogger<ReminderService>.Instance, sp);

        reminder.TargetTime.Should().Be("22:00");
        reminder.IsReminderScheduled.Should().BeTrue();
    }
}
