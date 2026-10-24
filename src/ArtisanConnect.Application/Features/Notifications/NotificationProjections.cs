using System.Linq.Expressions;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;

namespace ArtisanConnect.Application.Features.Notifications;

public static class NotificationProjections
{
    public static readonly Expression<Func<Notification, NotificationResult>> ToResult = n => new NotificationResult
    {
        NotificationId = n.Id,
        Type = n.Type.ToString(),
        Title = n.Title,
        Message = n.Message,
        JobId = n.JobId,
        IsRead = n.IsRead,
        CreatedAtUtc = n.CreatedAtUtc
    };
}
