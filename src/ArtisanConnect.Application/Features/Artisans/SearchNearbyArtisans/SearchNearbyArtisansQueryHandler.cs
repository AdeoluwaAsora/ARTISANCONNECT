using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;
using NetTopologySuite.Geometries;

namespace ArtisanConnect.Application.Features.Artisans.SearchNearbyArtisans;

public class SearchNearbyArtisansQueryHandler
    : IRequestHandler<SearchNearbyArtisansQuery, PaginatedList<ArtisanSummaryResult>>
{
    private readonly IApplicationDbContext _context;

    public SearchNearbyArtisansQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<ArtisanSummaryResult>> Handle(
        SearchNearbyArtisansQuery request,
        CancellationToken cancellationToken)
    {
        // X is longitude, Y is latitude (see STATUS.md "Geospatial").
        // Validator guarantees both are present.
        var origin = new Point(request.Longitude!.Value, request.Latitude!.Value) { SRID = 4326 };
        var radiusMeters = request.RadiusKm * 1000;

        // On geography columns these translate to PostGIS ST_DWithin / ST_Distance,
        // both in metres, and ST_DWithin uses the GiST index on Location.
        var artisans = _context.ArtisanProfiles.Where(a =>
            a.Location != null
            && a.User!.IsActive
            && a.Location.IsWithinDistance(origin, radiusMeters));

        if (request.Trade is not null)
        {
            artisans = artisans.Where(a => a.Trade == request.Trade.Value);
        }

        if (request.VerifiedOnly)
        {
            artisans = artisans.Where(a => a.IsVerified);
        }

        if (request.AvailableOnly)
        {
            artisans = artisans.Where(a => a.IsAvailable);
        }

        var query = artisans
            .OrderBy(a => a.Location!.Distance(origin))
            .Select(a => new ArtisanSummaryResult
            {
                ArtisanId = a.UserId,
                Name = a.User!.FirstName + " " + a.User.LastName,
                Trade = a.Trade.ToString(),
                YearsOfExperience = a.YearsOfExperience,
                Bio = a.Bio,
                HourlyRate = a.HourlyRate,
                IsVerified = a.IsVerified,
                IsAvailable = a.IsAvailable,
                ProfilePictureUrl = a.ProfilePictureUrl,
                City = a.City,
                DistanceKm = a.Location!.Distance(origin) / 1000,
                JobsCompleted = _context.Jobs.Count(j =>
                    j.AssignedArtisanId == a.UserId && j.Status == JobStatus.Completed)
            });

        return await PaginatedList<ArtisanSummaryResult>.CreateAsync(
            query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
