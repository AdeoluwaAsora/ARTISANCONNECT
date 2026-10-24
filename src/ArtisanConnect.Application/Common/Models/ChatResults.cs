namespace ArtisanConnect.Application.Common.Models;

/// <summary>A conversation as seen by one participant ("participant" is the other person).</summary>
public class ConversationResult
{
    public required Guid ConversationId { get; init; }
    public required Guid ParticipantId { get; init; }
    public required string ParticipantName { get; init; }
    public required string ParticipantRole { get; init; }

    /// <summary>Filled in after the query from the presence tracker.</summary>
    public bool IsOnline { get; set; }

    public Guid? JobId { get; init; }
    public string? JobTitle { get; init; }
    public string? LastMessage { get; init; }
    public DateTime? LastMessageAtUtc { get; init; }
    public required DateTime CreatedAtUtc { get; init; }

    /// <summary>Messages from the other person the viewer hasn't read yet.</summary>
    public required int UnreadCount { get; init; }
}

public class ChatMessageResult
{
    public required Guid MessageId { get; init; }
    public required Guid ConversationId { get; init; }
    public required Guid SenderId { get; init; }
    public required string SenderName { get; init; }
    public required string Content { get; init; }
    public required DateTime SentAtUtc { get; init; }

    /// <summary>When the other participant read it (null = not yet), for receipts.</summary>
    public DateTime? ReadAtUtc { get; init; }
}
