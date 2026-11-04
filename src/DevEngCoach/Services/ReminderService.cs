using System.Diagnostics;
using System.Runtime.InteropServices;

namespace DevEngCoach.Services;

public interface IReminderService
{
    bool IsReminderScheduled { get; }
    string TargetTime { get; }
    void TriggerNotification(string message, string title = "DevEng Coach (22:00)");
}

public sealed class ReminderService : BackgroundService, IReminderService
{
    private readonly ILogger<ReminderService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private DateTime? _lastNotificationDate;

    public string TargetTime => "22:00";
    public bool IsReminderScheduled => true;

    public ReminderService(ILogger<ReminderService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DevEng Coach ReminderService started. Monitoring for 22:00 daily reminder.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.Now;
                if (now.Hour == 22 && now.Minute == 0 && (_lastNotificationDate is null || _lastNotificationDate.Value.Date != now.Date))
                {
                    using var scope = _serviceProvider.CreateScope();
                    var progressService = scope.ServiceProvider.GetRequiredService<IProgressService>();
                    var summary = progressService.GetSummary();

                    // Check if already completed today
                    var todayCompleted = progressService.GetAllSessions()
                        .Any(s => s.CompletedAt.HasValue && s.CompletedAt.Value.Date == now.Date);

                    if (!todayCompleted)
                    {
                        TriggerNotification($"Đã đến 22:00! Hãy mở dashboard và dành 30 phút luyện phát âm & mẫu câu kỹ thuật Ngày {summary.NextDayNumber}.");
                        _lastNotificationDate = now;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking reminder time.");
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    public void TriggerNotification(string message, string title = "DevEng Coach (22:00)")
    {
        _logger.LogInformation("Dispatching notification: {Title} - {Message}", title, message);

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            try
            {
                // PowerShell notification via Windows Toast or MessageBox fallback
                var escapedTitle = title.Replace("\"", "`\"");
                var escapedMessage = message.Replace("\"", "`\"");

                var script = $$"""
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$template = @"
<toast>
    <visual>
        <binding template="ToastGeneric">
            <text>{{escapedTitle}}</text>
            <text>{{escapedMessage}}</text>
        </binding>
    </visual>
</toast>
"@
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("DevEngCoach").Show($toast)
""";

                var startInfo = new ProcessStartInfo
                {
                    FileName = "powershell",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{script.Replace("\n", " ")}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to invoke Windows Toast notification.");
            }
        }
    }
}
