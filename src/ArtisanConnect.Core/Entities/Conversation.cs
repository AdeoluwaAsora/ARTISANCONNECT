using ArtisanConnect.Core.Common;

namespace ArtisanConnect.Core.Entities;

/// <summary>
/// A chat between one customer and one artisan. There is at most one per pair;
/// JobId records the job they're talking about (updated when a chat is opened
/// from a different job).
/// </summary>
public class Conversation : BaseEntity
{
    public required Guid CustomerId { get; set; }
    public User? Customer { get; set; }

    public required Guid ArtisanId { get; set; }
    public User? Artisan { get; set; }

    public Guid? JobId { get; set; }
    public Job? Job { get; set; }

    /// <summary>Denormalised for the conversation list, so it doesn't scan messages.</summary>
    public DateTime? LastMessageAtUtc { get; set; }
    public string? LastMessagePreview { get; set; }

    /// <summary>
    /// Read state per participant: every message from the other person sent
    /// after this time is unread. Also drives read receipts.
    /// </summary>
    public DateTime? CustomerLastReadAtUtc { get; set; }
    public DateTime? ArtisanLastReadAtUtc { get; set; }

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
