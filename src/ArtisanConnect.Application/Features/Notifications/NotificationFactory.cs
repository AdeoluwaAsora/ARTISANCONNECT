using System.Globalization;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.Application.Features.Notifications;

/// <summary>
/// Builds every notification the app sends, so the wording lives in one place.
/// Handlers add the result to the DbContext before their single SaveChangesAsync.
/// </summary>
public static class NotificationFactory
{
    private static string Naira(decimal amount) =>
        "₦" + amount.ToString("#,0.##", CultureInfo.InvariantCulture);

    public static Notification NewBid(Job job, string artisanName, decimal amount) => new()
    {
        UserId = job.CustomerId,
        Type = NotificationType.NewBid,
        Title = "New bid on your job",
        Message = $"{artisanName} bid {Naira(amount)} on \"{job.Title}\".",
        JobId = job.Id
    };

    public static Notification BidAccepted(Job job, Guid artisanId) => new()
    {
        UserId = artisanId,
        Type = NotificationType.BidAccepted,
        Title = "Your bid was accepted",
        Message = $"You got the job \"{job.Title}\". Get in touch with the customer to arrange the work.",
        JobId = job.Id
    };

    public static Notification BidRejected(Job job, Guid artisanId, bool anotherBidAccepted) => new()
    {
        UserId = artisanId,
        Type = NotificationType.BidRejected,
        Title = anotherBidAccepted ? "Job assigned to someone else" : "Your bid wasn't accepted",
        Message = anotherBidAccepted
            ? $"The customer chose another artisan for \"{job.Title}\"."
            : $"The customer declined your bid on \"{job.Title}\".",
        JobId = job.Id
    };

    public static Notification JobCancelled(Job job, Guid artisanId) => new()
    {
        UserId = artisanId,
        Type = NotificationType.JobCancelled,
        Title = "Job cancelled",
        Message = $"The customer cancelled \"{job.Title}\", so your bid is closed.",
        JobId = job.Id
    };
}
