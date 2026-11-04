using DevEngCoach.Common;
using DevEngCoach.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Register Core Domain Services
builder.Services.AddSingleton<ICurriculumService, CurriculumService>();
builder.Services.AddSingleton<IProgressService, ProgressService>();
builder.Services.AddSingleton<IAiCoachService, AiCoachService>();

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

// AI Coach Evaluation Endpoints (AGY CLI integration)
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
