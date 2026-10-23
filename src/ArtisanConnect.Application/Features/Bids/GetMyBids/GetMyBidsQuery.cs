using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.GetMyBids;

/// <summary>The signed-in artisan's bids across all jobs, newest first.</summary>
public record GetMyBidsQuery : IRequest<PaginatedList<BidResult>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
