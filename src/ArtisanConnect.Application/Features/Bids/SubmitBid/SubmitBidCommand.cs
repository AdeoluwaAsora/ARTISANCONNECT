using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.SubmitBid;

public record SubmitBidCommand : IRequest<BidResult>
{
    public required Guid JobId { get; init; }
    public required decimal Amount { get; init; }
    public required int EtaMinutes { get; init; }
    public required string Message { get; init; }
}
