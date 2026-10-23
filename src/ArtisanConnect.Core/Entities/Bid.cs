using ArtisanConnect.Core.Common;
using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.Core.Entities;

/// <summary>
/// An artisan's offer to do a job. An artisan has at most one active
/// (non-withdrawn) bid per job; accepting one bid assigns the job and
/// rejects every other pending bid on it.
/// </summary>
public class Bid : BaseEntity
{
    public required Guid JobId { get; set; }
    public Job? Job { get; set; }

    /// <summary>The artisan's User.Id (same identity as Job.AssignedArtisanId).</summary>
    public required Guid ArtisanId { get; set; }
    public User? Artisan { get; set; }

    public required decimal Amount { get; set; }

    /// <summary>How soon the artisan says they can arrive, in minutes.</summary>
    public required int EtaMinutes { get; set; }

    public required string Message { get; set; }

    public BidStatus Status { get; set; } = BidStatus.Pending;
}
