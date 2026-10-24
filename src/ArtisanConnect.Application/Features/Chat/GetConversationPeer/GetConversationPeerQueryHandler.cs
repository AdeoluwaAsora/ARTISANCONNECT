using ArtisanConnect.Application.Common.Interfaces;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetConversationPeer;

public class GetConversationPeerQueryHandler : IRequestHandler<GetConversationPeerQuery, Guid>
{
    private readonly IApplicationDbContext _context;

    public GetConversationPeerQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(GetConversationPeerQuery request, CancellationToken cancellationToken)
    {
        var conversation = await ChatAccess.GetForParticipantAsync(
            _context, request.ConversationId, request.UserId, cancellationToken);

        return ChatAccess.OtherParticipant(conversation, request.UserId);
    }
}
