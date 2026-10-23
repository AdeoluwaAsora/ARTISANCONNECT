using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;

namespace ArtisanConnect.Application.Features.Artisans.SearchNearbyArtisans;

/// <summary>
/// Artisans within RadiusKm of a point, nearest first. Public: no sign-in needed.
/// Artisans who haven't set a service location are not included.
/// </summary>
public record SearchNearbyArtisansQuery : IRequest<PaginatedList<ArtisanSummaryResult>>
{
    public const double DefaultRadiusKm = 50;
    public const double MaxRadiusKm = 200;

    /// <summary>Required; nullable only so a missing value fails validation instead of meaning 0.</summary>
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public double RadiusKm { get; init; } = DefaultRadiusKm;

    public Trade? Trade { get; init; }
    public bool VerifiedOnly { get; init; }
    public bool AvailableOnly { get; init; }

    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
