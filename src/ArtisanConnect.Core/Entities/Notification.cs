using ArtisanConnect.Core.Common;
using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.Core.Entities;

/// <summary>
/// An in-app message for one user. Created in the same SaveChanges as the
/// change it describes, so a notification never exists without its cause
/// (and vice versa).
/// </summary>
public class Notification : BaseEntity
{
    /// <summary>Who the notification is for.</summary>
    public required Guid UserId { get; set; }
    public User? User { get; set; }

    public required NotificationType Type { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }

    /// <summary>The job it's about, so the app can link to it. Null for non-job notifications.</summary>
    public Guid? JobId { get; set; }

    public bool IsRead { get; set; }
    public DateTime? ReadAtUtc { get; set; }
}
