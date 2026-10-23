using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Jobs.GetJobById;

public class GetJobByIdQueryHandler : IRequestHandler<GetJobByIdQuery, JobResult>
{
    private readonly IApplicationDbContext _context;

    public GetJobByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<JobResult> Handle(GetJobByIdQuery request, CancellationToken cancellationToken)
    {
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == request.JobId, cancellationToken);

        if (job is null)
        {
            throw new NotFoundException(nameof(Core.Entities.Job), request.JobId);
        }

        return new JobResult
        {
            JobId = job.Id,
            CustomerId = job.CustomerId,
            Title = job.Title,
            Description = job.Description,
            RequiredTrade = job.RequiredTrade.ToString(),
            BudgetMin = job.BudgetMin,
            BudgetMax = job.BudgetMax,
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