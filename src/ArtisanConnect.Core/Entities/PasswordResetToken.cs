using ArtisanConnect.Core.Common;

namespace ArtisanConnect.Core.Entities;

public class PasswordResetToken : BaseEntity
{
    public required Guid UserId { get; set; }
    public User? User { get; set; }

    public required string TokenHash { get; set; }

    public required DateTime ExpiresAtUtc { get; set; }

    public DateTime? UsedAtUtc { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
    public bool IsUsed => UsedAtUtc != null;
    public bool IsActive => !IsUsed && !IsExpired;
}