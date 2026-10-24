using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetMyConversations;

/// <summary>The signed-in user's conversations, most recent activity first.</summary>
public record GetMyConversationsQuery : IRequest<PaginatedList<ConversationResult>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}
