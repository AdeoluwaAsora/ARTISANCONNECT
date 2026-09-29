using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Authentication.Login;

public record LoginCommand : IRequest<AuthResult>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public string? IpAddress { get; init; }
}
