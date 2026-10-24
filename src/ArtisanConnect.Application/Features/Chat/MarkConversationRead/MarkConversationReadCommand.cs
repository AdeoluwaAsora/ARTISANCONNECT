using MediatR;

namespace ArtisanConnect.Application.Features.Chat.MarkConversationRead;

/// <summary>Marks everything in the conversation as read by the signed-in user.</summary>
public record MarkConversationReadCommand : IRequest
{
    public required Guid ConversationId { get; init; }
}
