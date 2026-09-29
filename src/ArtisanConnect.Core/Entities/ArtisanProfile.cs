using ArtisanConnect.Core.Common;
using ArtisanConnect.Core.Enums;

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
}