using MediatR;

namespace ArtisanConnect.Application.Features.Notifications.MarkAllNotificationsRead;

/// <summary>Marks every unread notification of the signed-in user as read; returns how many changed.</summary>
public record MarkAllNotificationsReadCommand : IRequest<int>;
