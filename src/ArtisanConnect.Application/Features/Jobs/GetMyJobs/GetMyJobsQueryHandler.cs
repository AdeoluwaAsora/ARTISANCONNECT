using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.GetMyJobs;

public class GetMyJobsQueryHandler : IRequestHandler<GetMyJobsQuery, PaginatedList<JobResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetMyJobsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<JobResult>> Handle(GetMyJobsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var query = _context.Jobs
            .Where(j => j.CustomerId == _currentUser.UserId)
            .OrderByDescending(j => j.CreatedAtUtc)
            .Select(JobProjections.ToResult);

        return await PaginatedList<JobResult>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}