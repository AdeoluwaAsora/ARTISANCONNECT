using MediatR;

namespace ArtisanConnect.Application.Features.Authentication.Logout;

public record LogoutCommand : IRequest
{
    public required string RefreshToken { get; init; }
    public string? IpAddress { get; init; }
}