using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace ArtisanConnect.Application.Features.Artisans.GetArtisanById;

public class GetArtisanByIdQueryHandler : IRequestHandler<GetArtisanByIdQuery, ArtisanSummaryResult>
{
    private readonly IApplicationDbContext _context;

    public GetArtisanByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ArtisanSummaryResult> Handle(GetArtisanByIdQuery request, CancellationToken cancellationToken)
    {
        // Out-of-range or half-given coordinates just mean "no distance", not an error.
        var hasOrigin = request.Latitude is >= -90 and <= 90 && request.Longitude is >= -180 and <= 180;
        var origin = hasOrigin
            ? new Point(request.Longitude!.Value, request.Latitude!.Value) { SRID = 4326 }
            : null;

        var result = await _context.ArtisanProfiles
            .Where(a => a.UserId == request.ArtisanId && a.User!.IsActive)
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
                DistanceKm = origin != null && a.Location != null
                    ? a.Location.Distance(origin) / 1000
                    : null,
                JobsCompleted = _context.Jobs.Count(j =>
                    j.AssignedArtisanId == a.UserId && j.Status == JobStatus.Completed)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (result is null)
        {
            throw new NotFoundException(nameof(ArtisanProfile), request.ArtisanId);
        }

        return result;
    }
}
