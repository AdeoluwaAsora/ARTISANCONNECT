using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.API.Controllers;

public class RegisterRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public required UserRole Role { get; init; }

    public Trade? Trade { get; init; }
    public int? YearsOfExperience { get; init; }
}