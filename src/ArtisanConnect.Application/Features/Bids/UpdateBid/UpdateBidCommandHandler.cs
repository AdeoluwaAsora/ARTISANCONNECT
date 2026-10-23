using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Bids.UpdateBid;

public class UpdateBidCommandHandler : IRequestHandler<UpdateBidCommand, BidResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateBidCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<BidResult> Handle(UpdateBidCommand request, CancellationToken cancellationToken)
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

        if (bid.ArtisanId != _currentUser.UserId)
        {
            throw new ForbiddenAccessException("You can only edit your own bids.");
        }

        if (bid.Status != BidStatus.Pending)
        {
            throw new ConflictException($"This bid can no longer be edited because its status is '{bid.Status}'.");
        }

        if (bid.Job!.Status != JobStatus.Open)
        {
            throw new ConflictException($"This job is no longer accepting bids because its status is '{bid.Job.Status}'.");
        }

        bid.Amount = request.Amount;
        bid.EtaMinutes = request.EtaMinutes;
        bid.Message = request.Message.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return await _context.Bids
            .Where(b => b.Id == bid.Id)
            .Select(BidProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}
