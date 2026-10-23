using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Bids.GetMyBids;

public class GetMyBidsQueryHandler : IRequestHandler<GetMyBidsQuery, PaginatedList<BidResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetMyBidsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<BidResult>> Handle(GetMyBidsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var query = _context.Bids
            .Where(b => b.ArtisanId == _currentUser.UserId)
            .OrderByDescending(b => b.CreatedAtUtc)
            .Select(BidProjections.ToResult);

        return await PaginatedList<BidResult>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
