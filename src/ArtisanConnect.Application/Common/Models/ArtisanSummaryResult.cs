namespace ArtisanConnect.Application.Common.Models;

/// <summary>
/// An artisan as anyone (even a visitor who isn't signed in) can see them.
/// Deliberately has no coordinates: other users only ever get a distance.
/// </summary>
public class ArtisanSummaryResult
{
    /// <summary>The artisan's User.Id (same id used by bids and job assignment).</summary>
    public required Guid ArtisanId { get; init; }
    public required string Name { get; init; }
    public required string Trade { get; init; }
    public required int YearsOfExperience { get; init; }
    public string? Bio { get; init; }
    public decimal? HourlyRate { get; init; }
    public required bool IsVerified { get; init; }
    public required bool IsAvailable { get; init; }
    public string? ProfilePictureUrl { get; init; }
    public string? City { get; init; }

    /// <summary>Kilometres from the search origin; null when no origin was given.</summary>
    public double? DistanceKm { get; init; }

    public required int JobsCompleted { get; init; }
}
