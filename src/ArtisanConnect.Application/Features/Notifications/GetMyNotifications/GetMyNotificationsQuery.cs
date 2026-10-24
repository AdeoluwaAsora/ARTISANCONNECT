using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Notifications.GetMyNotifications;

/// <summary>The signed-in user's notifications, newest first.</summary>
public record GetMyNotificationsQuery : IRequest<PaginatedList<NotificationResult>>
{
    public bool UnreadOnly { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
