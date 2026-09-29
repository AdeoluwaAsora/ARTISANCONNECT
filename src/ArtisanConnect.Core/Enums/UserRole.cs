namespace ArtisanConnect.Core.Enums;

/// <summary>
/// The three roles from the SRS. Kept as an enum (persisted as string in
/// Postgres via EF Core's HasConversion, configured in Infrastructure)
/// rather than a free-text Roles table, because the MVP has a small,
/// fixed set of roles that map directly to authorization policies in
/// code. If we later need dynamic, admin-configurable roles, this is the
/// seam where we'd introduce a full RBAC table - not before.
/// </summary>
public enum UserRole
{
    Customer = 1,
    Artisan = 2,
    Admin = 3
}
