using System.Security.Claims;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Core.Enums;
using Microsoft.AspNetCore.Http;

namespace ArtisanConnect.Infrastructure.Identity;

/// <summary>
/// Reads "who is calling" off the claims the JWT middleware already
/// validated and attached to HttpContext.User. This is the one place in
/// the whole solution that touches HttpContext directly for identity -
/// every handler downstream just injects ICurrentUserService.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid? UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);

    public UserRole? Role
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<UserRole>(value, out var role) ? role : null;
        }
    }
}
