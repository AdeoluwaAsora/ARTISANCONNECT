using ArtisanConnect.API.Extensions;
using ArtisanConnect.API.Hubs;
using ArtisanConnect.API.Middleware;
using ArtisanConnect.Application;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Infrastructure;
using AspNetCoreRateLimit;
using Serilog;

// --- Bootstrap logger: catches startup failures (e.g. bad connection
// string) that happen before the full DI-configured logger exists. ---
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting ArtisanConnect API");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console());

    // ---------- Layer registration ----------
    // Each layer owns and exposes exactly one extension method. Program.cs
    // never reaches into Infrastructure/Application internals directly -
    // that's the whole point of Clean Architecture's dependency rule.
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // ---------- API-specific wiring ----------
    builder.Services.AddControllers();
    builder.Services.AddSwaggerDocumentation();
    builder.Services.AddCorsPolicy(builder.Configuration);
    builder.Services.AddSignalR();
    // The hub lives here in API, so its Application-facing notifier does too.
    builder.Services.AddScoped<IChatNotifier, SignalRChatNotifier>();
    // NOTE: authorization services + role policies (RequireCustomerRole,
    // RequireArtisanRole, RequireAdminRole) are already registered inside
    // AddInfrastructure() via AddAuthorizationBuilder() - calling
    // AddAuthorization() again here would be redundant.

    // Rate limiting protects auth endpoints (login, forgot-password) and
    // the job-broadcast endpoint from brute-force/abuse. Config lives in
    // appsettings.json under "IpRateLimiting" so limits can be tuned per
    // environment without a code change.
    builder.Services.AddMemoryCache();
    builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
    builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
    builder.Services.AddInMemoryRateLimiting();
    builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

    builder.Services.AddHealthChecks()
        .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "postgresql")
        .AddRedis(builder.Configuration.GetConnectionString("Redis")!, name: "redis");

    var app = builder.Build();

    // ---------- Middleware pipeline ----------
    // Order is deliberate and matters a great deal in ASP.NET Core:
    // exception handling wraps EVERYTHING; rate limiting runs before
    // auth so an attacker gets throttled before we even parse their
    // token; HTTPS redirection and CORS run before routing/auth checks.
    app.UseGlobalExceptionHandling();

    app.UseIpRateLimiting();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "ArtisanConnect API v1");
        });
    }
    else
    {
        // HSTS only makes sense once we're past local HTTP-over-Docker dev.
        app.UseHsts();
    }

    app.UseHttpsRedirection();

    app.UseSerilogRequestLogging();

    app.UseCors(CorsExtensions.PolicyName);

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    // Real-time hubs. JWTs reach them as ?access_token=... (see Infrastructure's
    // JwtBearer OnMessageReceived), and nginx proxies /hubs/ with WebSocket upgrade.
    app.MapHub<ChatHub>("/hubs/chat");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "ArtisanConnect API terminated unexpectedly during startup");
}
finally
{
    Log.CloseAndFlush();
}

// Exposes the implicit Program class to the WebApplicationFactory<Program>
// used by integration tests in ArtisanConnect.API.IntegrationTests.
public partial class Program { }
