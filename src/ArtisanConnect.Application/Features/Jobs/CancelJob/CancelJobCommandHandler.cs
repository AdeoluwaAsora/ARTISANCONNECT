using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using ArtisanConnect.Application.Features.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Jobs.CancelJob;

public class CancelJobCommandHandler : IRequestHandler<CancelJobCommand, JobResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CancelJobCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<JobResult> Handle(CancelJobCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == request.JobId, cancellationToken);

        if (job is null)
        {
            throw new NotFoundException(nameof(Core.Entities.Job), request.JobId);
        }

        if (job.CustomerId != _currentUser.UserId)
        {
            throw new ForbiddenAccessException("You can only cancel your own jobs.");
        }

        if (job.Status != JobStatus.Open)
        {
            throw new ConflictException($"This job can no longer be cancelled because its status is '{job.Status}'.");
        }

        job.Status = JobStatus.Cancelled;

        // Close every pending bid on the job and tell those artisans, in the
        // same save, so no bid is left "Pending" on a cancelled job.
        var pendingBids = await _context.Bids
            .Where(b => b.JobId == job.Id && b.Status == BidStatus.Pending)
            .ToListAsync(cancellationToken);

        foreach (var bid in pendingBids)
        {
            bid.Status = BidStatus.Rejected;
            _context.Notifications.Add(NotificationFactory.JobCancelled(job, bid.ArtisanId));
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Re-read through the shared projection so the result includes bid count etc.
        return await _context.Jobs
            .Where(j => j.Id == job.Id)
            .Select(JobProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}