using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.GetOpenJobs;

public class GetOpenJobsQueryHandler : IRequestHandler<GetOpenJobsQuery, PaginatedList<JobResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetOpenJobsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<JobResult>> Handle(GetOpenJobsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var jobs = _context.Jobs.Where(j => j.Status == JobStatus.Open);

        if (request.Trade is not null)
        {
            jobs = jobs.Where(j => j.RequiredTrade == request.Trade.Value);
        }

        var query = jobs
            .OrderByDescending(j => j.CreatedAtUtc)
            .Select(JobProjections.ToResult);

        return await PaginatedList<JobResult>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
