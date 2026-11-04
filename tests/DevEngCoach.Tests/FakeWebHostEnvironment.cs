using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace DevEngCoach.Tests;

public sealed class FakeWebHostEnvironment(string contentRootPath) : IWebHostEnvironment
{
    public string WebRootPath { get; set; } = Path.Combine(contentRootPath, "wwwroot");
    public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    public string ApplicationName { get; set; } = "DevEngCoach";
    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    public string ContentRootPath { get; set; } = contentRootPath;
    public string EnvironmentName { get; set; } = "Development";
}
