using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.GetOpenJobs;

/// <summary>
/// Open jobs that artisans can browse and bid on, newest first.
/// </summary>
public record GetOpenJobsQuery : IRequest<PaginatedList<JobResult>>
{
    /// <summary>Optional: only return jobs needing this trade.</summary>
    public Trade? Trade { get; init; }

    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
