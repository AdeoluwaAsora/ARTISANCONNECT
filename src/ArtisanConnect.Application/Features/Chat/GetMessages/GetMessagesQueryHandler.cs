using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetMessages;

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, PaginatedList<ChatMessageResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetMessagesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<ChatMessageResult>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var conversation = await ChatAccess.GetForParticipantAsync(
            _context, request.ConversationId, _currentUser.UserId.Value, cancellationToken);

        var query = _context.ChatMessages
            .Where(m => m.ConversationId == conversation.Id)
            .OrderByDescending(m => m.CreatedAtUtc)
            .Select(ChatProjections.MessageToResult);

        return await PaginatedList<ChatMessageResult>.CreateAsync(
            query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
