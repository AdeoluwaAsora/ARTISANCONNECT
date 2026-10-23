using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Bids.SubmitBid;

public class SubmitBidCommandHandler : IRequestHandler<SubmitBidCommand, BidResult>
{
    private const string AlreadyBidMessage =
        "You already have a bid on this job. Edit or withdraw it instead of submitting another.";

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SubmitBidCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<BidResult> Handle(SubmitBidCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var artisanId = _currentUser.UserId.Value;

        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == request.JobId, cancellationToken);

        if (job is null)
        {
            throw new NotFoundException(nameof(Job), request.JobId);
        }

        if (job.Status != JobStatus.Open)
        {
            throw new ConflictException($"This job is no longer accepting bids because its status is '{job.Status}'.");
        }

        var hasActiveBid = await _context.Bids.AnyAsync(
            b => b.JobId == job.Id && b.ArtisanId == artisanId && b.Status != BidStatus.Withdrawn,
            cancellationToken);

        if (hasActiveBid)
        {
            throw new ConflictException(AlreadyBidMessage);
        }

        var bid = new Bid
        {
            JobId = job.Id,
            ArtisanId = artisanId,
            Amount = request.Amount,
            EtaMinutes = request.EtaMinutes,
            Message = request.Message.Trim(),
            Status = BidStatus.Pending
        };

        _context.Bids.Add(bid);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // The unique "one active bid per artisan per job" index caught a
            // double submit that slipped past the check above.
            throw new ConflictException(AlreadyBidMessage);
        }

        return await _context.Bids
            .Where(b => b.Id == bid.Id)
            .Select(BidProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}
