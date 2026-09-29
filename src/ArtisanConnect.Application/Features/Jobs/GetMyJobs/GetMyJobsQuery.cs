using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.GetMyJobs;

public record GetMyJobsQuery : IRequest<PaginatedList<JobResult>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}