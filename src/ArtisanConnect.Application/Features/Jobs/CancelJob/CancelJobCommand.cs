using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.CancelJob;

public record CancelJobCommand : IRequest<JobResult>
{
    public required Guid JobId { get; init; }
}