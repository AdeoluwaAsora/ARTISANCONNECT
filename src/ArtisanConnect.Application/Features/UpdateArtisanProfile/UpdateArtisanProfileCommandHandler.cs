using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Users.GetMyProfile;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Artisans.UpdateArtisanProfile;

public class UpdateArtisanProfileCommandHandler : IRequestHandler<UpdateArtisanProfileCommand, UserProfileResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ISender _mediator;

    public UpdateArtisanProfileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ISender mediator)
    {
        _context = context;
        _currentUser = currentUser;
        _mediator = mediator;
    }

    public async Task<UserProfileResult> Handle(UpdateArtisanProfileCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var artisanProfile = await _context.ArtisanProfiles
            .FirstOrDefaultAsync(a => a.UserId == _currentUser.UserId, cancellationToken);

        if (artisanProfile is null)
        {
            throw new NotFoundException(nameof(Core.Entities.ArtisanProfile), _currentUser.UserId);
        }

        artisanProfile.Trade = request.Trade;
        artisanProfile.YearsOfExperience = request.YearsOfExperience;
        artisanProfile.Bio = request.Bio;
        artisanProfile.HourlyRate = request.HourlyRate;
        artisanProfile.IsAvailable = request.IsAvailable;

        await _context.SaveChangesAsync(cancellationToken);

        return await _mediator.Send(new GetMyProfileQuery(), cancellationToken);
    }
}