using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;

namespace ArtisanConnect.Application.Features.Authentication.Register;

public record RegisterCommand : IRequest<AuthResult>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public required UserRole Role { get; init; }

    public Trade? Trade { get; init; }
    public int? YearsOfExperience { get; init; }

    public string? IpAddress { get; init; }
}