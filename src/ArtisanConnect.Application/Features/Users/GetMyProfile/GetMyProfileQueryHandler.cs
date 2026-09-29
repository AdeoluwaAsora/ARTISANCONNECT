using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Users.GetMyProfile;

public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, UserProfileResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetMyProfileQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UserProfileResult> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException(nameof(Core.Entities.User), _currentUser.UserId);
        }

        ArtisanProfileResult? artisanProfileResult = null;

        if (user.Role == UserRole.Artisan)
        {
            var artisanProfile = await _context.ArtisanProfiles
                .FirstOrDefaultAsync(a => a.UserId == user.Id, cancellationToken);

            if (artisanProfile is not null)
            {
                artisanProfileResult = new ArtisanProfileResult
                {
                    Trade = artisanProfile.Trade.ToString(),
                    YearsOfExperience = artisanProfile.YearsOfExperience,
                    IsVerified = artisanProfile.IsVerified,
                    IsAvailable = artisanProfile.IsAvailable,
                    Bio = artisanProfile.Bio,
                    HourlyRate = artisanProfile.HourlyRate,
                    ProfilePictureUrl = artisanProfile.ProfilePictureUrl
                };
            }
        }

        return new UserProfileResult
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            IsEmailVerified = user.IsEmailVerified,
            LastLoginAtUtc = user.LastLoginAtUtc,
            ArtisanProfile = artisanProfileResult
        };
    }
}