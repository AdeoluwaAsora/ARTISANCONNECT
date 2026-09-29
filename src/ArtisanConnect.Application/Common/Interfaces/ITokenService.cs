using ArtisanConnect.Core.Entities;

namespace ArtisanConnect.Application.Common.Interfaces;

public interface ITokenService
{
    /// <summary>Signed JWT access token, short-lived (see Jwt:AccessTokenExpiryMinutes).</summary>
    string GenerateAccessToken(User user);

    /// <summary>Raw refresh token string returned to the client. Caller is
    /// responsible for hashing it before persisting a RefreshToken row.</summary>
    string GenerateRefreshToken();

    /// <summary>SHA-256 hash of a raw token string, used for both refresh
    /// tokens and password reset tokens before they're stored.</summary>
    string HashToken(string rawToken);
}
