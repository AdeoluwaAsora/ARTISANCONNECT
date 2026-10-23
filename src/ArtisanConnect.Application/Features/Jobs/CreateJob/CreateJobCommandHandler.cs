using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace ArtisanConnect.Application.Features.Jobs.CreateJob;

public class CreateJobCommandHandler : IRequestHandler<CreateJobCommand, JobResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateJobCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<JobResult> Handle(CreateJobCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var location = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        var job = new Job
        {
            CustomerId = _currentUser.UserId.Value,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            RequiredTrade = request.RequiredTrade,
            BudgetMin = request.BudgetMin,
            BudgetMax = request.BudgetMax,
            Urgency = request.Urgency,
            Location = location,
            Address = request.Address,
            Status = JobStatus.Open
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync(cancellationToken);

        // Re-read through the shared projection so the result includes bid count etc.
        return await _context.Jobs
            .Where(j => j.Id == job.Id)
            .Select(JobProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}