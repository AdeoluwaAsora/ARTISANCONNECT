namespace ArtisanConnect.Application.Common.Models;

public record AuthResult
{
    public required Guid UserId { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string Role { get; init; }
    // Optional artisan profile fields returned on auth responses
    public string? Trade { get; init; }
    public int? YearsExperience { get; init; }
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
    public required DateTime AccessTokenExpiresAtUtc { get; init; }
}
