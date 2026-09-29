
using ArtisanConnect.Core.Common;

namespace ArtisanConnect.Core.Entities;

public class RefreshToken : BaseEntity
{
    public required Guid UserId { get; set; }

    public required string TokenHash { get; set; }

    public DateTime ExpiresAtUtc { get; set; }

    public string? CreatedByIp { get; set; }

    // When a token is revoked (explicit logout or rotated), this is set.
    public DateTime? RevokedAtUtc { get; set; }

    // IP address that caused the revocation (logout or rotation)
    public string? RevokedByIp { get; set; }

    // If this token was rotated, this stores the hash of the replacing token.
    public string? ReplacedByTokenHash { get; set; }

    // Navigation property to the owning user. Kept here because
    // application logic sometimes needs the user when handling tokens.
    public User? User { get; set; }

    // Computed helpers commonly used by the application layer.
    public bool IsRevoked => RevokedAtUtc != null;
    public bool IsExpired => ExpiresAtUtc <= DateTime.UtcNow;
    public bool IsActive => !IsRevoked && !IsExpired;
}
