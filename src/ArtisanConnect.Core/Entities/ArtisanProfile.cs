using ArtisanConnect.Core.Common;
using ArtisanConnect.Core.Enums;
using NetTopologySuite.Geometries;

namespace ArtisanConnect.Core.Entities;

public class ArtisanProfile : BaseEntity
{
    public required Guid UserId { get; set; }
    public User? User { get; set; }

    public required Trade Trade { get; set; }
    public required int YearsOfExperience { get; set; }

    public bool IsVerified { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? Bio { get; set; }
    public decimal? HourlyRate { get; set; }
    public string? ProfilePictureUrl { get; set; }

    /// <summary>
    /// Where the artisan works from; what Nearby Search measures distance to.
    /// Same convention as Job.Location: new Point(longitude, latitude), SRID 4326.
    /// Null until the artisan sets it, and such artisans are left out of search.
    /// Never returned to other users; only the computed distance is.
    /// </summary>
    public Point? Location { get; set; }

    /// <summary>City shown on the artisan's profile, e.g. "Lagos".</summary>
    public string? City { get; set; }
}