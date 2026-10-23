using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Bids.GetBidsForJob;

public class GetBidsForJobQueryHandler : IRequestHandler<GetBidsForJobQuery, PaginatedList<BidResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetBidsForJobQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<BidResult>> Handle(GetBidsForJobQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var userId = _currentUser.UserId.Value;

        var job = await _context.Jobs
            .Where(j => j.Id == request.JobId)
            .Select(j => new { j.Id, j.CustomerId })
            .FirstOrDefaultAsync(cancellationToken);

        if (job is null)
        {
            throw new NotFoundException(nameof(Job), request.JobId);
        }

        IQueryable<Bid> bids;

        if (job.CustomerId == userId)
        {
            bids = _context.Bids.Where(b => b.JobId == job.Id && b.Status != BidStatus.Withdrawn);
        }
        else if (_currentUser.Role == UserRole.Artisan)
        {
            bids = _context.Bids.Where(b => b.JobId == job.Id && b.ArtisanId == userId);
        }
        else
        {
            throw new ForbiddenAccessException("You can only view bids on your own jobs.");
        }

        var query = bids
            .OrderByDescending(b => b.CreatedAtUtc)
            .Select(BidProjections.ToResult);

        return await PaginatedList<BidResult>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
