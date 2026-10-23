namespace ArtisanConnect.Application.Common.Models;

public class JobResult
{
    public required Guid JobId { get; init; }
    public required Guid CustomerId { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required string RequiredTrade { get; init; }
    public required decimal BudgetMin { get; init; }
    public required decimal BudgetMax { get; init; }
    public required string Urgency { get; init; }
    public required string Status { get; init; }
    public required double Latitude { get; init; }
    public required double Longitude { get; init; }
    public string? Address { get; init; }
    public Guid? AssignedArtisanId { get; init; }
    public string? AssignedArtisanName { get; init; }

    /// <summary>Bids that are still live (excludes withdrawn ones).</summary>
    public required int BidCount { get; init; }

    public required DateTime CreatedAtUtc { get; init; }
}