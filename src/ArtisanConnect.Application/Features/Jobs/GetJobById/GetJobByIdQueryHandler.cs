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
        var result = await _context.Jobs
            .Where(j => j.Id == request.JobId)
            .Select(JobProjections.ToResult)
            .FirstOrDefaultAsync(cancellationToken);

        if (result is null)
        {
            throw new NotFoundException(nameof(Core.Entities.Job), request.JobId);
        }

        return result;
    }
}