using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.GetJobById;

public record GetJobByIdQuery : IRequest<JobResult>
{
    public required Guid JobId { get; init; }
}