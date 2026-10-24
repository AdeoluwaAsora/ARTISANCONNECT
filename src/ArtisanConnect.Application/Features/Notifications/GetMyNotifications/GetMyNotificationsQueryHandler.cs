using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Notifications.GetMyNotifications;

public class GetMyNotificationsQueryHandler
    : IRequestHandler<GetMyNotificationsQuery, PaginatedList<NotificationResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetMyNotificationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<NotificationResult>> Handle(
        GetMyNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var notifications = _context.Notifications.Where(n => n.UserId == _currentUser.UserId);

        if (request.UnreadOnly)
        {
            notifications = notifications.Where(n => !n.IsRead);
        }

        var query = notifications
            .OrderByDescending(n => n.CreatedAtUtc)
            .Select(NotificationProjections.ToResult);

        return await PaginatedList<NotificationResult>.CreateAsync(
            query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
