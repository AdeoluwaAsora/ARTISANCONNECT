using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.API.Controllers;

public class UpdateArtisanProfileRequest
{
    public required Trade Trade { get; init; }
    public required int YearsOfExperience { get; init; }
    public string? Bio { get; init; }
    public decimal? HourlyRate { get; init; }
    public required bool IsAvailable { get; init; }
}