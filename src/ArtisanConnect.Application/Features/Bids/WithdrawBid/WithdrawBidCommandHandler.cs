using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Bids.WithdrawBid;

public class WithdrawBidCommandHandler : IRequestHandler<WithdrawBidCommand, BidResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public WithdrawBidCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<BidResult> Handle(WithdrawBidCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var bid = await _context.Bids
            .FirstOrDefaultAsync(b => b.Id == request.BidId, cancellationToken);

        if (bid is null)
        {
            throw new NotFoundException(nameof(Bid), request.BidId);
        }

        if (bid.ArtisanId != _currentUser.UserId)
        {
            throw new ForbiddenAccessException("You can only withdraw your own bids.");
        }

        // Only pending bids: an accepted bid means the job is already assigned,
        // and backing out of that is a cancellation/dispute flow, not a withdrawal.
        if (bid.Status != BidStatus.Pending)
        {
            throw new ConflictException($"This bid can no longer be withdrawn because its status is '{bid.Status}'.");
        }

        bid.Status = BidStatus.Withdrawn;

        await _context.SaveChangesAsync(cancellationToken);

        return await _context.Bids
            .Where(b => b.Id == bid.Id)
            .Select(BidProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}
