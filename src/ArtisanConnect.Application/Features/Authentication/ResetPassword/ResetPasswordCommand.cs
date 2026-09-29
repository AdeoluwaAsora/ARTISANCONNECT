using MediatR;

namespace ArtisanConnect.Application.Features.Authentication.ResetPassword;

public record ResetPasswordCommand : IRequest
{
    public required string Token { get; init; }
    public required string NewPassword { get; init; }
    public required string ConfirmNewPassword { get; init; }
}