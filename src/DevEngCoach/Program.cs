using DevEngCoach.Common;
using DevEngCoach.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Register Core Domain Services
builder.Services.AddSingleton<ICurriculumService, CurriculumService>();
builder.Services.AddSingleton<IProgressService, ProgressService>();
builder.Services.AddSingleton<IAiCoachService, AiCoachService>();
builder.Services.AddSingleton<ISparringService, SparringService>();
builder.Services.AddSingleton<IPrPolisherService, PrPolisherService>();
builder.Services.AddSingleton<ISrsService, SrsService>();
builder.Services.AddSingleton<ISpeechScoringService, SpeechScoringService>();
builder.Services.AddSingleton<IAnalyticsService, AnalyticsService>();
builder.Services.AddSingleton<IShadowingService, ShadowingService>();
builder.Services.AddSingleton<IMouthMapService, MouthMapService>();
builder.Services.AddSingleton<ISrsWarmupService, SrsWarmupService>();
builder.Services.AddSingleton<ICheatSheetService, CheatSheetService>();
builder.Services.AddSingleton<IIpaGlossaryService, IpaGlossaryService>();
builder.Services.AddSingleton<IBackupService, BackupService>();
builder.Services.AddSingleton<ICapstoneService, CapstoneService>();

// Register Reminder as both IHostedService and IReminderService
builder.Services.AddSingleton<ReminderService>();
builder.Services.AddSingleton<IReminderService>(sp => sp.GetRequiredService<ReminderService>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<ReminderService>());

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl = "no-cache";
    }
});

// Curriculum Endpoints
var curriculumApi = app.MapGroup("/api/curriculum");

curriculumApi.MapGet("/", (ICurriculumService curriculum) =>
    Results.Ok(curriculum.GetAllLessons()));

curriculumApi.MapGet("/{day:int}", (int day, ICurriculumService curriculum) =>
{
    var lesson = curriculum.GetLessonByDay(day);
    return lesson is not null ? Results.Ok(lesson) : Results.NotFound(new { Message = $"Day {day} not found." });
});

curriculumApi.MapGet("/sprint/{sprintId:int}", (int sprintId, ICurriculumService curriculum) =>
    Results.Ok(curriculum.GetLessonsBySprint(sprintId)));

curriculumApi.MapGet("/cheatsheet/{sprintId:int}", (int sprintId, ICheatSheetService cheatSheetService) =>
{
    if (sprintId < 1 || sprintId > 6)
        return Results.BadRequest(new { error = "Sprint ID must be between 1 and 6." });
    return Results.Ok(cheatSheetService.GetSprintCheatSheet(sprintId));
})
.WithName("GetSprintCheatSheetFromCurriculum");

// Progress & Telemetry Endpoints
var progressApi = app.MapGroup("/api/progress");

progressApi.MapGet("/", (IProgressService progress) =>
    Results.Ok(progress.GetSummary()));

progressApi.MapGet("/sessions", (IProgressService progress) =>
    Results.Ok(progress.GetAllSessions()));

progressApi.MapGet("/sessions/{day:int}", (int day, IProgressService progress) =>
{
    var session = progress.GetSessionByDay(day);
    return session is not null ? Results.Ok(session) : Results.NotFound(new { Message = $"Session for Day {day} not found." });
});

progressApi.MapPost("/complete", ([FromBody] CompleteSessionRequest request, IProgressService progress) =>
{
    var session = progress.CompleteSession(request);
    return Results.Ok(session);
});

progressApi.MapPost("/reset", (IProgressService progress) =>
{
    progress.ResetProgress();
    return Results.Ok(new { Message = "Progress reset to Day 1." });
});

// AI Coach Evaluation Endpoints
app.MapPost("/api/ai/evaluate", async ([FromBody] AiEvaluationRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.InputText))
    {
        return Results.BadRequest(new { Message = "InputText is required for evaluation." });
    }

    var evaluation = await aiCoach.EvaluateAsync(request, ct);
    return Results.Ok(evaluation);
});

app.MapPost("/api/ai/standup-simulate", async ([FromBody] StandupSimulationRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Yesterday) && string.IsNullOrWhiteSpace(request.Today))
    {
        return Results.BadRequest(new { Message = "At least Yesterday or Today must be provided." });
    }

    var result = await aiCoach.SimulateStandupAsync(request, ct);
    return Results.Ok(result);
});

app.MapPost("/api/ai/demo-simulate", async ([FromBody] DemoSimulationRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Context) && string.IsNullOrWhiteSpace(request.Architecture))
    {
        return Results.BadRequest(new { Message = "Context or Architecture must be provided." });
    }

    var result = await aiCoach.SimulateDemoAsync(request, ct);
    return Results.Ok(result);
});

app.MapPost("/api/ai/pingpong-simulate", async ([FromBody] PingPongSimulationRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Answer) && string.IsNullOrWhiteSpace(request.FullResponse))
    {
        return Results.BadRequest(new { Message = "Answer or FullResponse must be provided." });
    }

    var result = await aiCoach.SimulatePingPongAsync(request, ct);
    return Results.Ok(result);
});

// 1-on-1 Career & Progress Sync Simulation Endpoint
app.MapPost("/api/ai/one-on-one-simulate", async ([FromBody] OneOnOneSimulationRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.ProgressAndWins) && string.IsNullOrWhiteSpace(request.SystemBottleneck))
    {
        return Results.BadRequest(new { Message = "ProgressAndWins or SystemBottleneck must be provided." });
    }

    var result = await aiCoach.SimulateOneOnOneAsync(request, ct);
    return Results.Ok(result);
});

// Connected Speech & Linking Analyzer Endpoint
app.MapPost("/api/ai/connected-speech-analyze", async ([FromBody] ConnectedSpeechAnalyzeRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Text))
    {
        return Results.BadRequest(new { Message = "Text is required for connected speech analysis." });
    }

    var result = await aiCoach.AnalyzeConnectedSpeechAsync(request, ct);
    return Results.Ok(result);
});

// Quick Selection Lookup Endpoint (FR-012: Tra cứu tức thì khi bôi đen chữ)
app.MapPost("/api/ai/lookup", async ([FromBody] QuickLookupRequest request, IAiCoachService aiCoach, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Text))
    {
        return Results.BadRequest(new { Message = "Text is required for lookup." });
    }

    var result = await aiCoach.LookupAsync(request, ct);
    return Results.Ok(result);
});

// Sparring Endpoints
var sparringApi = app.MapGroup("/api/sparring");
sparringApi.MapGet("/scenarios", (ISparringService sparring) =>
    Results.Ok(sparring.GetScenarios()));

sparringApi.MapPost("/turn", async ([FromBody] SparringTurnRequest request, ISparringService sparring, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.UserSpeech))
    {
        return Results.BadRequest(new { Message = "UserSpeech is required for sparring turn." });
    }
    var response = await sparring.ProcessTurnAsync(request, ct);
    return Results.Ok(response);
});

// PR Polisher Endpoints
var prApi = app.MapGroup("/api/pr");
prApi.MapPost("/polish", async ([FromBody] PrPolishRequest request, IPrPolisherService polisher, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.InputText))
    {
        return Results.BadRequest(new { Message = "InputText is required for polishing." });
    }
    var response = await polisher.PolishAsync(request, ct);
    return Results.Ok(response);
});

// SRS Leitner Endpoints
var srsApi = app.MapGroup("/api/srs");
srsApi.MapGet("/queue", (ISrsService srs) =>
    Results.Ok(srs.GetDueItems()));

srsApi.MapGet("/all", (ISrsService srs) =>
    Results.Ok(srs.GetAllItems()));

srsApi.MapGet("/stats", (ISrsService srs) =>
    Results.Ok(srs.GetStats()));

srsApi.MapPost("/review", ([FromBody] SrsReviewRequest request, ISrsService srs) =>
{
    if (string.IsNullOrWhiteSpace(request.ItemId))
    {
        return Results.BadRequest(new { Message = "ItemId is required." });
    }
    var item = srs.RecordReview(request);
    return Results.Ok(item);
});

srsApi.MapPost("/enroll", ([FromBody] SrsEnrollRequest request, ISrsService srs) =>
{
    if (string.IsNullOrWhiteSpace(request.WordOrPhrase))
    {
        return Results.BadRequest(new { Message = "WordOrPhrase is required." });
    }
    var item = srs.AutoEnrollWeakSpot(request);
    return Results.Ok(item);
});

// Speech Scoring Endpoints (Feature 002)
var speechApi = app.MapGroup("/api/speech");
speechApi.MapPost("/score", async ([FromBody] SpeechScoreRequest request, ISpeechScoringService speechService, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.TargetWordOrSentence))
    {
        return Results.BadRequest(new { Message = "TargetWordOrSentence is required." });
    }
    var response = await speechService.ScoreSpeechAsync(request, ct);
    return Results.Ok(response);
});

speechApi.MapPost("/transcribe", async ([FromBody] SpeechTranscribeRequest? req, ISpeechScoringService speechService, CancellationToken ct) =>
{
    var result = await speechService.TranscribeFallbackAsync(req ?? new SpeechTranscribeRequest(), ct);
    return Results.Ok(result);
})
.WithName("TranscribeSpeech");

speechApi.MapGet("/scores/summary", async (ISpeechScoringService speechService, CancellationToken ct) =>
    Results.Ok(await speechService.GetSummaryAsync(ct)));

speechApi.MapGet("/scores/history", async (ISpeechScoringService speechService, CancellationToken ct) =>
    Results.Ok(await speechService.GetHistoryAsync(50, ct)));

// Analytics Endpoints (Feature 003)
var analyticsApi = app.MapGroup("/api/analytics");
analyticsApi.MapGet("/burndown", async (IAnalyticsService analytics, CancellationToken ct) =>
    Results.Ok(await analytics.GetBurndownDataAsync(ct)));

analyticsApi.MapGet("/heatmap", async (IAnalyticsService analytics, CancellationToken ct) =>
    Results.Ok(await analytics.GetHeatmapGridAsync(ct)));

analyticsApi.MapGet("/badges", async (IAnalyticsService analytics, CancellationToken ct) =>
    Results.Ok(await analytics.GetStreakBadgesAsync(ct)));

analyticsApi.MapGet("/velocity", async (IAnalyticsService analytics, CancellationToken ct) =>
    Results.Ok(await analytics.GetWeeklyVelocityAsync(ct)));

analyticsApi.MapGet("/overview", async (IAnalyticsService analytics, CancellationToken ct) =>
    Results.Ok(await analytics.GetOverviewAsync(ct)));

analyticsApi.MapGet("/blocks", async (IAnalyticsService analyticsService, CancellationToken ct) =>
    Results.Ok((await analyticsService.GetOverviewAsync(ct)).BlockFrequency));

analyticsApi.MapGet("/catchup", async (IAnalyticsService analyticsService, CancellationToken ct) =>
    Results.Ok(await analyticsService.GetCatchUpPlanAsync(ct)));

// Shadowing Endpoints (Feature 004)
var shadowingApi = app.MapGroup("/api/shadowing");
shadowingApi.MapPost("/evaluate", async ([FromBody] ShadowingEvaluateRequest request, IShadowingService shadowingService, CancellationToken ct) =>
{
    var response = await shadowingService.EvaluateShadowingAsync(request, ct);
    return Results.Ok(response);
});

shadowingApi.MapGet("/reference/{day:int}", async (int day, IShadowingService shadowingService, CancellationToken ct) =>
    Results.Ok(await shadowingService.GetReferenceInfoAsync(day, ct)));

// Micro-Lesson Endpoints (Feature 005)
var microApi = app.MapGroup("/api/microlesson");
microApi.MapGet("/recommendation", (IProgressService progress) =>
    Results.Ok(progress.GetRecommendation()));

progressApi.MapPost("/micro-complete", ([FromBody] MicroSessionRequest request, IProgressService progress) =>
{
    var session = progress.MicroCompleteSession(request);
    var summary = progress.GetSummary();
    return Results.Ok(new MicroSessionResponse(
        Success: true,
        DayNumber: request.DayNumber,
        SelectedBlock: request.SelectedBlock,
        CurrentStreakDays: summary.CurrentStreakDays,
        Status: session.Status,
        Message: $"Hoàn thành phiên 10 phút ({request.SelectedBlock})! Chuỗi học được duy trì: {summary.CurrentStreakDays} ngày."
    ));
});

// Vietnamese Mouth-Map Endpoints (Feature 006)
var mouthMapApi = app.MapGroup("/api/mouthmap");
mouthMapApi.MapGet("/all", (IMouthMapService mouthMap) =>
    Results.Ok(mouthMap.GetAllEntries()));
mouthMapApi.MapGet("/{phoneme}", (string phoneme, IMouthMapService mouthMap) =>
{
    var entry = mouthMap.GetEntry(phoneme);
    return entry is not null ? Results.Ok(entry) : Results.NotFound(new { Message = $"Phoneme {phoneme} not found." });
});

// Spaced Repetition Warm-Up Endpoints (Feature 007)
srsApi.MapGet("/warmup", async (ISrsWarmupService warmupService, CancellationToken ct) =>
    Results.Ok(await warmupService.GetWarmupBatchAsync(ct)));

// Sprint Cheat Sheet Endpoints (Feature 008)
var cheatSheetApi = app.MapGroup("/api/cheatsheet");
cheatSheetApi.MapGet("/{sprintId:int}", (int sprintId, ICheatSheetService cheatSheet) =>
    Results.Ok(cheatSheet.GetSprintCheatSheet(sprintId)));

// Auto-Complete Configurable Threshold Endpoints (Feature 009)
var drillApi = app.MapGroup("/api/drill");
drillApi.MapPost("/check-threshold", ([FromBody] DrillThresholdCheckRequest req, ISrsService srs, IProgressService progressService) =>
{
    var total = Math.Max(0, req.TotalWordsCount);
    var correct = Math.Clamp(req.EffectiveCorrectCount, 0, Math.Max(1, total));
    var validThreshold = req.ThresholdPercentage is 60 or 70 or 80 or 90 ? req.ThresholdPercentage : 70;
    var requiredCount = total > 0 ? Math.Max(1, (int)Math.Floor(total * (validThreshold / 100.0))) : 0;
    var percentage = total > 0 ? Math.Round((double)correct / total * 100.0, 1) : 0.0;
    var reached = total > 0 && correct >= requiredCount;
    var mode = (total > 0 && correct >= total) || percentage >= 100.0
        ? "Perfect"
        : (reached ? "AutoThreshold" : "Pending");

    var enrolled = new List<string>();
    var marked = false;

    if (reached)
    {
        if (req.FailedWords is { Count: > 0 })
        {
            var targetPhoneme = string.IsNullOrWhiteSpace(req.TargetPhoneme) ? "/coda/" : req.TargetPhoneme;
            foreach (var word in req.FailedWords.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrWhiteSpace(word))
                {
                    var trimmed = word.Trim();
                    srs.AutoEnrollWeakSpot(new SrsEnrollRequest(
                        trimmed,
                        targetPhoneme,
                        $"Day {req.DayNumber} {validThreshold}% threshold auto-enroll",
                        50));
                    enrolled.Add(trimmed);
                }
            }
        }

        if (req.DayNumber > 0)
        {
            progressService.CompleteSession(new CompleteSessionRequest(
                DayNumber: req.DayNumber,
                ActualMinutes: 15,
                SelfRating: percentage >= 90 ? 5 : 4,
                LearnerNotes: $"Auto-completed via {validThreshold}% threshold ({correct}/{total} correct)",
                AiFeedbackSnippet: mode == "Perfect"
                    ? "Perfect drill accuracy! Session completed."
                    : "Good enough completion! Weak words queued in SRS."
            ));
            marked = true;
        }
    }

    var currentStreak = progressService.GetSummary().CurrentStreakDays;
    var nailedWords = req.CorrectWords ?? Array.Empty<string>();

    var message = reached
        ? (mode == "Perfect" || percentage >= 90
            ? $"🏆 Xuất sắc! {correct}/{total} ({percentage}%) — Đạt chuẩn xuất sắc! Phiên học hoàn tất."
            : $"🎉 Tuyệt vời! Bạn đã đạt {correct}/{total} ({percentage}%). Buổi học đã hoàn thành! {enrolled.Count} từ còn vấp đã được tự động lưu vào SRS ngày mai.")
        : $"Đã đạt {correct}/{total} ({percentage}%). Cần đạt {validThreshold}% ({requiredCount}/{total}) để hoàn thành tự động.";

    return Results.Ok(new DrillThresholdCheckResponse(
        ThresholdReached: reached,
        AccuracyPercentage: percentage,
        AutoCompleted: marked,
        CelebrationMessage: message,
        EnrolledInSrsWords: enrolled,
        CanKeepGoing: true,
        RequiredWordsCount: requiredCount,
        CompletionMode: mode,
        NailedWords: nailedWords,
        CurrentStreakDays: currentStreak,
        DayMarkedComplete: marked
    ));
});

// IPA Tooltips Glossary Endpoints (Feature 010)
var ipaApi = app.MapGroup("/api/ipa");
ipaApi.MapGet("/glossary", (IIpaGlossaryService glossary) =>
    Results.Ok(glossary.GetAll()));
ipaApi.MapGet("/{symbol}", (string symbol, IIpaGlossaryService glossary) =>
{
    var data = glossary.Lookup(symbol);
    return data is not null ? Results.Ok(data) : Results.NotFound(new { Message = $"IPA symbol {symbol} not found." });
});

// Reminder Service Endpoints
var reminderApi = app.MapGroup("/api/reminder");

reminderApi.MapGet("/status", (IReminderService reminder, IProgressService progress) =>
{
    var summary = progress.GetSummary();
    return Results.Ok(new
    {
        TargetTime = reminder.TargetTime,
        IsActive = reminder.IsReminderScheduled,
        NextDay = summary.NextDayNumber,
        CurrentStreak = summary.CurrentStreakDays
    });
});

reminderApi.MapPost("/test", (IReminderService reminder) =>
{
    reminder.TriggerNotification("Kiểm tra thông báo nhắc nhở 22:00: Hệ thống sẵn sàng!", "DevEng Coach");
    return Results.Ok(new { Message = "Test toast notification triggered." });
});

// Backup & Portability Endpoints
var backupApi = app.MapGroup("/api/backup");
backupApi.MapGet("/export", (IBackupService backup) =>
    Results.Ok(backup.GetFullBackup()));

backupApi.MapPost("/import", ([FromBody] BackupPayload payload, IBackupService backup) =>
{
    var result = backup.ImportBackup(payload);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
});

// Milestone Capstone Endpoints
var capstoneApi = app.MapGroup("/api/capstone");
capstoneApi.MapGet("/{day:int}", (int day, ICapstoneService capstone) =>
{
    try
    {
        var spec = capstone.GetCapstoneSpec(day);
        return Results.Ok(spec);
    }
    catch (ArgumentException ex)
    {
        return Results.NotFound(new { Message = ex.Message });
    }
});

capstoneApi.MapPost("/evaluate", async ([FromBody] CapstoneSubmissionRequest request, ICapstoneService capstone, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Transcript))
    {
        return Results.BadRequest(new { Message = "Transcript is required for capstone evaluation." });
    }
    var result = await capstone.EvaluateCapstoneAsync(request, ct);
    return Results.Ok(result);
});

app.Run();

// For WebApplicationFactory in integration tests
public partial class Program { }
