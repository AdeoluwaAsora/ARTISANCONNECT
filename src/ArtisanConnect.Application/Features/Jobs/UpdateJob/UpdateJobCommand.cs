using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;

namespace ArtisanConnect.Application.Features.Jobs.UpdateJob;

public record UpdateJobCommand : IRequest<JobResult>
{
    public required Guid JobId { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required Trade RequiredTrade { get; init; }
    public required decimal BudgetMin { get; init; }
    public required decimal BudgetMax { get; init; }
    public required JobUrgency Urgency { get; init; }
    public required double Latitude { get; init; }
    public required double Longitude { get; init; }
    public string? Address { get; init; }
}