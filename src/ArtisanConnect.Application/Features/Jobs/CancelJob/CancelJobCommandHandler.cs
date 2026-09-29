using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
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

        await _context.SaveChangesAsync(cancellationToken);

        return new JobResult
        {
            JobId = job.Id,
            CustomerId = job.CustomerId,
            Title = job.Title,
            Description = job.Description,
            RequiredTrade = job.RequiredTrade.ToString(),
            Budget = job.Budget,
            Urgency = job.Urgency.ToString(),
            Status = job.Status.ToString(),
            Latitude = job.Location.Y,
            Longitude = job.Location.X,
            Address = job.Address,
            AssignedArtisanId = job.AssignedArtisanId,
            CreatedAtUtc = job.CreatedAtUtc
        };
    }
}