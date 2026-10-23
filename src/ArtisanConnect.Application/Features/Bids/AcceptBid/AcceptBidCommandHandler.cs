using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Bids.AcceptBid;

/// <summary>
/// Accepts one bid and, in the same SaveChanges (one transaction): marks the
/// job Assigned to that artisan and rejects every other pending bid on it.
/// </summary>
public class AcceptBidCommandHandler : IRequestHandler<AcceptBidCommand, BidResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AcceptBidCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<BidResult> Handle(AcceptBidCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var bid = await _context.Bids
            .Include(b => b.Job)
            .FirstOrDefaultAsync(b => b.Id == request.BidId, cancellationToken);

        if (bid is null)
        {
            throw new NotFoundException(nameof(Bid), request.BidId);
        }

        var job = bid.Job!;

        if (job.CustomerId != _currentUser.UserId)
        {
            throw new ForbiddenAccessException("You can only accept bids on your own jobs.");
        }

        if (job.Status != JobStatus.Open)
        {
            throw new ConflictException($"This job can no longer be assigned because its status is '{job.Status}'.");
        }

        if (bid.Status != BidStatus.Pending)
        {
            throw new ConflictException($"This bid can't be accepted because its status is '{bid.Status}'.");
        }

        var otherPendingBids = await _context.Bids
            .Where(b => b.JobId == job.Id && b.Id != bid.Id && b.Status == BidStatus.Pending)
            .ToListAsync(cancellationToken);

        bid.Status = BidStatus.Accepted;
        job.Status = JobStatus.Assigned;
        job.AssignedArtisanId = bid.ArtisanId;

        foreach (var other in otherPendingBids)
        {
            other.Status = BidStatus.Rejected;
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // The "one accepted bid per job" unique index rejected this save:
            // another bid on this job was accepted at the same moment.
            throw new ConflictException("Another bid on this job was just accepted. Refresh to see the latest status.");
        }

        return await _context.Bids
            .Where(b => b.Id == bid.Id)
            .Select(BidProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}
