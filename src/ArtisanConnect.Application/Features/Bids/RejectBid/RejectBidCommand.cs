using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.RejectBid;

public record RejectBidCommand : IRequest<BidResult>
{
    public required Guid BidId { get; init; }
}
