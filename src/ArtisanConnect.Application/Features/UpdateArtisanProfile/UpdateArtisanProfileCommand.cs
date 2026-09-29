using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;

namespace ArtisanConnect.Application.Features.Artisans.UpdateArtisanProfile;

public record UpdateArtisanProfileCommand : IRequest<UserProfileResult>
{
    public required Trade Trade { get; init; }
    public required int YearsOfExperience { get; init; }
    public string? Bio { get; init; }
    public decimal? HourlyRate { get; init; }
    public bool IsAvailable { get; init; }
}