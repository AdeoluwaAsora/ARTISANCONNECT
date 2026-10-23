using ArtisanConnect.Core.Common;
using ArtisanConnect.Core.Enums;
using NetTopologySuite.Geometries;

namespace ArtisanConnect.Core.Entities;

public class Job : BaseEntity
{
    public required Guid CustomerId { get; set; }
    public User? Customer { get; set; }

    public required string Title { get; set; }
    public required string Description { get; set; }
    public required Trade RequiredTrade { get; set; }
    public required decimal BudgetMin { get; set; }
    public required decimal BudgetMax { get; set; }
    public required JobUrgency Urgency { get; set; }
    public required Point Location { get; set; }
    public string? Address { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Open;
    public Guid? AssignedArtisanId { get; set; }
    public User? AssignedArtisan { get; set; }

    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}