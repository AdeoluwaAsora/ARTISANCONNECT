using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetMessages;

/// <summary>
/// A conversation's messages, newest first (page 1 = most recent). Clients
/// reverse each page for display. Participants only.
/// </summary>
public record GetMessagesQuery : IRequest<PaginatedList<ChatMessageResult>>
{
    public required Guid ConversationId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}
