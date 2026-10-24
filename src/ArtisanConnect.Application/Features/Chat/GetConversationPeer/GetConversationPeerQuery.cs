using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetConversationPeer;

/// <summary>
/// For the ChatHub: the other participant of a conversation, after checking
/// UserId takes part in it. UserId is passed in because hub calls identify the
/// user from the connection, not from an HTTP request.
/// </summary>
public record GetConversationPeerQuery : IRequest<Guid>
{
    public required Guid ConversationId { get; init; }
    public required Guid UserId { get; init; }
}
