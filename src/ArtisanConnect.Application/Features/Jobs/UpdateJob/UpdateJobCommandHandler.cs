using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace ArtisanConnect.Application.Features.Jobs.UpdateJob;

public class UpdateJobCommandHandler : IRequestHandler<UpdateJobCommand, JobResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateJobCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<JobResult> Handle(UpdateJobCommand request, CancellationToken cancellationToken)
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
            throw new ForbiddenAccessException("You can only edit your own jobs.");
        }

        if (job.Status != JobStatus.Open)
        {
            throw new ConflictException($"This job can no longer be edited because its status is '{job.Status}'. Only Open jobs can be edited.");
        }

        job.Title = request.Title.Trim();
        job.Description = request.Description.Trim();
        job.RequiredTrade = request.RequiredTrade;
        job.BudgetMin = request.BudgetMin;
        job.BudgetMax = request.BudgetMax;
        job.Urgency = request.Urgency;
        job.Location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };
        job.Address = request.Address;

        await _context.SaveChangesAsync(cancellationToken);

        // Re-read through the shared projection so the result includes bid count etc.
        return await _context.Jobs
            .Where(j => j.Id == job.Id)
            .Select(JobProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}