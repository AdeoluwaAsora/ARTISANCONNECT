using MediatR;

namespace ArtisanConnect.Application.Features.Authentication.ForgotPassword;

public record ForgotPasswordCommand : IRequest
{
    public required string Email { get; init; }
}