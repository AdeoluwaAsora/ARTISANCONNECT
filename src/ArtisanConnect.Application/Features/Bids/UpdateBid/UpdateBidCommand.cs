using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.UpdateBid;

public record UpdateBidCommand : IRequest<BidResult>
{
    public required Guid BidId { get; init; }
    public required decimal Amount { get; init; }
    public required int EtaMinutes { get; init; }
    public required string Message { get; init; }
}
