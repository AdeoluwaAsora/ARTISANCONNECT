using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.Application.Common.Interfaces;

/// <summary>
/// Wraps "who is calling right now". Implemented in Infrastructure by
/// reading claims off IHttpContextAccessor. Handlers depend on this
/// interface instead of HttpContext directly, which keeps Application
/// free of any ASP.NET Core dependency and makes handlers trivially
/// unit-testable with a fake user.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}

/// <summary>
/// Wraps "what time is it". Same reasoning as above: a handler that
/// calls DateTime.UtcNow directly can't be deterministically unit
/// tested. Inject this instead and tests can supply a fixed instant.
/// </summary>
public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
