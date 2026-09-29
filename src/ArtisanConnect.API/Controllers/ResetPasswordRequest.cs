namespace ArtisanConnect.API.Controllers;

public class ResetPasswordRequest
{
    public required string Token { get; init; }
    public required string NewPassword { get; init; }
    public required string ConfirmNewPassword { get; init; }
}