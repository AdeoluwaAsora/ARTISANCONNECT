using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.GetBidsForJob;

/// <summary>
/// Bids on one job. The job's owner sees every live (non-withdrawn) bid;
/// an artisan sees only their own bid(s) on it, including withdrawn ones.
/// </summary>
public record GetBidsForJobQuery : IRequest<PaginatedList<BidResult>>
{
    public required Guid JobId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}
