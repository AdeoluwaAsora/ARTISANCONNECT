namespace ArtisanConnect.Core.Common;

/// <summary>
/// Base class for every entity that has a durable identity and needs
/// audit timestamps. Using a Guid (not an int) as the primary key means
/// IDs can be generated client-side or in application code before the
/// row is ever inserted - this matters once you have offline mobile
/// clients, distributed job processing, or you want to avoid leaking
/// sequential row counts (e.g. "job #4" reveals you've only had 4 jobs).
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    /// <summary>
    /// Soft-delete flag. Artisan marketplaces need to preserve history
    /// (a completed job, a review, a payment) even after a user closes
    /// their account or an admin removes a listing. Hard deletes are
    /// reserved for GDPR/erasure requests, handled explicitly - never
    /// as the default behavior.
    /// </summary>
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Optimistic concurrency token. Postgres will populate this via
    /// xmin mapping configured in the EF Core configuration classes,
    /// which prevents two concurrent writers (e.g. two admins approving
    /// the same artisan at once) from silently overwriting each other.
    /// </summary>
    public uint RowVersion { get; set; }
}

/// <summary>
/// Marker interface applied to entities that raise domain events
/// (e.g. "BidAcceptedEvent" triggering notification + other-bids-rejected
/// side effects). Kept in Core so domain logic can raise events without
/// depending on MediatR, which lives in Application/Infrastructure.
/// </summary>
public interface IHasDomainEvents
{
    IReadOnlyCollection<DomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}

public abstract class DomainEvent
{
    public DateTime OccurredOnUtc { get; protected set; } = DateTime.UtcNow;
}
