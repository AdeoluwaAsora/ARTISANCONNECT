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
            .Select(j => new JobResult
            {
                JobId = j.Id,
                CustomerId = j.CustomerId,
                Title = j.Title,
                Description = j.Description,
                RequiredTrade = j.RequiredTrade.ToString(),
                Budget = j.Budget,
                Urgency = j.Urgency.ToString(),
                Status = j.Status.ToString(),
                Latitude = j.Location.Y,
                Longitude = j.Location.X,
                Address = j.Address,
                AssignedArtisanId = j.AssignedArtisanId,
                CreatedAtUtc = j.CreatedAtUtc
            });

        return await PaginatedList<JobResult>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}