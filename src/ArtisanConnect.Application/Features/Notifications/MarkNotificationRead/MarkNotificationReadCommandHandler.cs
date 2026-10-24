using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Notifications.MarkNotificationRead;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, NotificationResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public MarkNotificationReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IDateTimeProvider clock)
    {
        _context = context;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<NotificationResult> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId, cancellationToken);

        // Someone else's notification gets a 404, not a 403, so ids can't be probed.
        if (notification is null || notification.UserId != _currentUser.UserId)
        {
            throw new NotFoundException(nameof(Notification), request.NotificationId);
        }

        // Marking an already-read notification is a harmless no-op.
        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAtUtc = _clock.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await _context.Notifications
            .Where(n => n.Id == notification.Id)
            .Select(NotificationProjections.ToResult)
            .FirstAsync(cancellationToken);
    }
}
