namespace ArtisanConnect.Application.Common.Models;

public class UserProfileResult
{
	public required Guid UserId { get; init; }
	public required string Email { get; init; }
	public required string FirstName { get; init; }
	public required string LastName { get; init; }
	public string? PhoneNumber { get; init; }
	public required string Role { get; init; }
	public bool IsEmailVerified { get; init; }
	public DateTime? LastLoginAtUtc { get; init; }
	public ArtisanProfileResult? ArtisanProfile { get; init; }
}

public class ArtisanProfileResult
{
	public required string Trade { get; init; }
	public required int YearsOfExperience { get; init; }
	public bool IsVerified { get; init; }
	public bool IsAvailable { get; init; }
	public string? Bio { get; init; }
	public decimal? HourlyRate { get; init; }
	public string? ProfilePictureUrl { get; init; }
}