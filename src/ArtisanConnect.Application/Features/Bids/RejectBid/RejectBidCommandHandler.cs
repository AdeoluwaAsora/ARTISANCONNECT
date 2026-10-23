using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Bids.RejectBid;

public class RejectBidCommandHandler : IRequestHandler<RejectBidCommand, BidResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RejectBidCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<BidResult> Handle(RejectBidCommand request, CancellationToken cancellationToken)
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

        if (bid.Job!.CustomerId != _currentUser.UserId)
        {
            throw new ForbiddenAccessException("You can only reject bids on your own jobs.");
        }

        if (bid.Status != BidStatus.Pending)
        {
            throw new ConflictException($"This bid can't be rejected because its status is '{bid.Status}'.");
        }

        bid.Status = BidStatus.Rejected;

        await _context.SaveChangesAsync(cancellationToken);

        return await _context.Bids
            .Where(b => b.Id == bid.Id)
            .Select(BidProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}
