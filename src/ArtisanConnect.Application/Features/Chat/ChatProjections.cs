using System.Linq.Expressions;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;

namespace ArtisanConnect.Application.Features.Chat;

/// <summary>Chat entity-to-result mappings, translated to SQL by EF.</summary>
public static class ChatProjections
{
    /// <summary>A conversation from the viewer's side.</summary>
    public static Expression<Func<Conversation, ConversationResult>> ToResult(Guid viewerId) => c => new ConversationResult
    {
        ConversationId = c.Id,
        ParticipantId = c.CustomerId == viewerId ? c.ArtisanId : c.CustomerId,
        ParticipantName = c.CustomerId == viewerId
            ? c.Artisan!.FirstName + " " + c.Artisan.LastName
            : c.Customer!.FirstName + " " + c.Customer.LastName,
        ParticipantRole = c.CustomerId == viewerId ? "Artisan" : "Customer",
        JobId = c.JobId,
        JobTitle = c.Job == null ? null : c.Job.Title,
        LastMessage = c.LastMessagePreview,
        LastMessageAtUtc = c.LastMessageAtUtc,
        CreatedAtUtc = c.CreatedAtUtc,
        // Plain AND/OR rather than ?: so it translates to a simple SQL WHERE.
        UnreadCount = c.Messages.Count(m =>
            m.SenderId != viewerId
            && ((c.CustomerId == viewerId
                 && (c.CustomerLastReadAtUtc == null || m.CreatedAtUtc > c.CustomerLastReadAtUtc))
                || (c.ArtisanId == viewerId
                    && (c.ArtisanLastReadAtUtc == null || m.CreatedAtUtc > c.ArtisanLastReadAtUtc))))
    };

    /// <summary>A message; ReadAtUtc is when the other participant last read the chat, if after it was sent.</summary>
    public static readonly Expression<Func<ChatMessage, ChatMessageResult>> MessageToResult = m => new ChatMessageResult
    {
        MessageId = m.Id,
        ConversationId = m.ConversationId,
        SenderId = m.SenderId,
        SenderName = m.Sender!.FirstName + " " + m.Sender.LastName,
        Content = m.Content,
        SentAtUtc = m.CreatedAtUtc,
        ReadAtUtc = m.SenderId == m.Conversation!.CustomerId
            ? (m.Conversation.ArtisanLastReadAtUtc >= m.CreatedAtUtc ? m.Conversation.ArtisanLastReadAtUtc : null)
            : (m.Conversation.CustomerLastReadAtUtc >= m.CreatedAtUtc ? m.Conversation.CustomerLastReadAtUtc : null)
    };
}
