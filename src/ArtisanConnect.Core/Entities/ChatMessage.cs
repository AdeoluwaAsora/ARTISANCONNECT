using ArtisanConnect.Core.Common;

namespace ArtisanConnect.Core.Entities;

/// <summary>One message in a Conversation. Its sent time is BaseEntity.CreatedAtUtc.</summary>
public class ChatMessage : BaseEntity
{
    public required Guid ConversationId { get; set; }
    public Conversation? Conversation { get; set; }

    public required Guid SenderId { get; set; }
    public User? Sender { get; set; }

    public required string Content { get; set; }
}
