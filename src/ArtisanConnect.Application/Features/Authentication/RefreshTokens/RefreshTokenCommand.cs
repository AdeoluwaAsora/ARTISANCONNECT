using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Authentication.RefreshTokens;

public record RefreshTokenCommand : IRequest<AuthResult>
{
    public required string RefreshToken { get; init; }
    public string? IpAddress { get; init; }
}