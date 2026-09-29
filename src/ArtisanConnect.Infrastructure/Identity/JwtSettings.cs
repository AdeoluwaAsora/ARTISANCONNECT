namespace ArtisanConnect.Infrastructure.Identity;

/// <summary>
/// Bound from the "Jwt" section of configuration. In every environment
/// except local dev, the actual values come from environment variables
/// (see docker-compose.yml / .env), never from appsettings.json committed
/// to source control - appsettings.json only holds the non-secret shape
/// (Issuer, Audience, expiry minutes).
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public required string Secret { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int AccessTokenExpiryMinutes { get; init; } = 15;
    public int RefreshTokenExpiryDays { get; init; } = 7;
}
