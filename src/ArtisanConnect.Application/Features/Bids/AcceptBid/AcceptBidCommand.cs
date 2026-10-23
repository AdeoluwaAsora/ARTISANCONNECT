using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.AcceptBid;

public record AcceptBidCommand : IRequest<BidResult>
{
    public required Guid BidId { get; init; }
}
