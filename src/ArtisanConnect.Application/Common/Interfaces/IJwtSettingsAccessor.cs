namespace ArtisanConnect.Application.Common.Interfaces;

/// <summary>
/// Application needs the expiry numbers to compute AccessTokenExpiresAtUtc
/// and stamp RefreshToken.ExpiresAtUtc, but the concrete JwtSettings class
/// (bound from configuration, holding the actual secret) lives in
/// Infrastructure. This thin interface is the seam - Infrastructure
/// registers an implementation that just reads its own JwtSettings.
/// </summary>
public interface IJwtSettingsAccessor
{
    int AccessTokenExpiryMinutes { get; }
    int RefreshTokenExpiryDays { get; }
}
