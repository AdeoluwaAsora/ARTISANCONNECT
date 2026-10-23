using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Artisans.GetArtisanById;

/// <summary>
/// One artisan's public profile. Public: no sign-in needed. Pass the viewer's
/// coordinates to get a distance back; without them DistanceKm is null.
/// </summary>
public record GetArtisanByIdQuery : IRequest<ArtisanSummaryResult>
{
    /// <summary>The artisan's User.Id.</summary>
    public required Guid ArtisanId { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
}
