namespace ArtisanConnect.API.Extensions;

public static class CorsExtensions
{
    public const string PolicyName = "ArtisanConnectCorsPolicy";

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                if (allowedOrigins.Length == 0)
                {
                    // Local dev fallback only - docker-compose.override.yml
                    // sets Cors__AllowedOrigins__0 explicitly for every
                    // real environment. We never fall back to
                    // AllowAnyOrigin() combined with AllowCredentials(),
                    // since the browser rejects that combination anyway
                    // and it's a common source of "works in Postman,
                    // fails in browser" confusion.
                    policy.WithOrigins("http://localhost:3000", "http://localhost:5173");
                }
                else
                {
                    policy.WithOrigins(allowedOrigins);
                }

                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials(); // required for SignalR websocket negotiation with cookies/auth
            });
        });

        return services;
    }
}
