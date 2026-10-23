namespace ArtisanConnect.Application.Common.Models;

public class BidResult
{
    public required Guid BidId { get; init; }
    public required Guid JobId { get; init; }
    public required string JobTitle { get; init; }
    public required Guid ArtisanId { get; init; }
    public required string ArtisanName { get; init; }
    public required decimal Amount { get; init; }
    public required int EtaMinutes { get; init; }
    public required string Message { get; init; }
    public required string Status { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public DateTime? UpdatedAtUtc { get; init; }
}
