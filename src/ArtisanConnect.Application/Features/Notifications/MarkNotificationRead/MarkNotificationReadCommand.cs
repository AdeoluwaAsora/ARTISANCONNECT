using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Notifications.MarkNotificationRead;

public record MarkNotificationReadCommand : IRequest<NotificationResult>
{
    public required Guid NotificationId { get; init; }
}
