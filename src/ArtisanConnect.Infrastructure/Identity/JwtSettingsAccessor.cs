using ArtisanConnect.Application.Common.Interfaces;

namespace ArtisanConnect.Infrastructure.Identity;

public class JwtSettingsAccessor : IJwtSettingsAccessor
{
    private readonly JwtSettings _jwtSettings;

    public JwtSettingsAccessor(JwtSettings jwtSettings)
    {
        _jwtSettings = jwtSettings;
    }

    public int AccessTokenExpiryMinutes => _jwtSettings.AccessTokenExpiryMinutes;
    public int RefreshTokenExpiryDays => _jwtSettings.RefreshTokenExpiryDays;
}
