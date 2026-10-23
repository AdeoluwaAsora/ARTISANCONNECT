using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.WithdrawBid;

public record WithdrawBidCommand : IRequest<BidResult>
{
    public required Guid BidId { get; init; }
}
