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
app.UseStaticFiles();

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

speechApi.MapPost("/transcribe", (HttpRequest req) =>
{
    // Fallback phonetic transcription endpoint
    return Results.Ok(new { TranscribedText = "test commit", Confidence = 0.92 });
});

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

// Shadowing Endpoints (Feature 004)
var shadowingApi = app.MapGroup("/api/shadowing");
shadowingApi.MapPost("/evaluate", async ([FromBody] ShadowingEvaluateRequest request, IShadowingService shadowingService, CancellationToken ct) =>
{
    var response = await shadowingService.EvaluateShadowingAsync(request, ct);
    return Results.Ok(response);
});

shadowingApi.MapGet("/reference/{day:int}", async (int day, IShadowingService shadowingService, CancellationToken ct) =>
    Results.Ok(await shadowingService.GetReferenceInfoAsync(day, ct)));

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

app.Run();

// For WebApplicationFactory in integration tests
public partial class Program { }
