namespace ArtisanConnect.Application.Common.Models;

public class NotificationResult
{
    public required Guid NotificationId { get; init; }
    public required string Type { get; init; }
    public required string Title { get; init; }
    public required string Message { get; init; }
    public Guid? JobId { get; init; }
    public required bool IsRead { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}
