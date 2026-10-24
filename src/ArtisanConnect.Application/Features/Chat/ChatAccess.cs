using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Chat;

internal static class ChatAccess
{
    /// <summary>
    /// Loads a conversation the user takes part in. Anyone else gets a 404
    /// (not 403), so conversation ids can't be probed.
    /// </summary>
    public static async Task<Conversation> GetForParticipantAsync(
        IApplicationDbContext context,
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var conversation = await context.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken);

        if (conversation is null || (conversation.CustomerId != userId && conversation.ArtisanId != userId))
        {
            throw new NotFoundException(nameof(Conversation), conversationId);
        }

        return conversation;
    }

    public static Guid OtherParticipant(Conversation conversation, Guid userId) =>
        conversation.CustomerId == userId ? conversation.ArtisanId : conversation.CustomerId;
}
