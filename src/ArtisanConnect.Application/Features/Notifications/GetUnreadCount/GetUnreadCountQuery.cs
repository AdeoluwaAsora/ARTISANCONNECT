using MediatR;

namespace ArtisanConnect.Application.Features.Notifications.GetUnreadCount;

/// <summary>How many unread notifications the signed-in user has (for the bell badge).</summary>
public record GetUnreadCountQuery : IRequest<int>;
