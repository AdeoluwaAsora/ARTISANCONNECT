namespace ArtisanConnect.API.Controllers;

/// <summary>Body for submitting a new bid and for editing an existing one.</summary>
public class BidRequest
{
    public required decimal Amount { get; init; }
    public required int EtaMinutes { get; init; }
    public required string Message { get; init; }
}
