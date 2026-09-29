using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Users.GetMyProfile;

public record GetMyProfileQuery : IRequest<UserProfileResult>;