using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.API.Controllers;

public class UpdateJobRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required Trade RequiredTrade { get; init; }
    public required decimal Budget { get; init; }
    public required JobUrgency Urgency { get; init; }
    public required double Latitude { get; init; }
    public required double Longitude { get; init; }
    public string? Address { get; init; }
}