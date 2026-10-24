using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetMyConversations;

public class GetMyConversationsQueryHandler
    : IRequestHandler<GetMyConversationsQuery, PaginatedList<ConversationResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPresenceTracker _presence;

    public GetMyConversationsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPresenceTracker presence)
    {
        _context = context;
        _currentUser = currentUser;
        _presence = presence;
    }

    public async Task<PaginatedList<ConversationResult>> Handle(
        GetMyConversationsQuery request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var userId = _currentUser.UserId.Value;

        // Chats with no messages yet sort by when they were opened.
        var query = _context.Conversations
            .Where(c => c.CustomerId == userId || c.ArtisanId == userId)
            .OrderByDescending(c => c.LastMessageAtUtc ?? c.CreatedAtUtc)
            .Select(ChatProjections.ToResult(userId));

        var page = await PaginatedList<ConversationResult>.CreateAsync(
            query, request.PageNumber, request.PageSize, cancellationToken);

        foreach (var conversation in page.Items)
        {
            conversation.IsOnline = _presence.IsOnline(conversation.ParticipantId);
        }

        return page;
    }
}
