using ArtisanConnect.Application.Common.Interfaces;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.MarkConversationRead;

public class MarkConversationReadCommandHandler : IRequestHandler<MarkConversationReadCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;
    private readonly IChatNotifier _notifier;

    public MarkConversationReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IDateTimeProvider clock,
        IChatNotifier notifier)
    {
        _context = context;
        _currentUser = currentUser;
        _clock = clock;
        _notifier = notifier;
    }

    public async Task Handle(MarkConversationReadCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var userId = _currentUser.UserId.Value;
        var conversation = await ChatAccess.GetForParticipantAsync(
            _context, request.ConversationId, userId, cancellationToken);

        var now = _clock.UtcNow;
        if (conversation.CustomerId == userId)
        {
            conversation.CustomerLastReadAtUtc = now;
        }
        else
        {
            conversation.ArtisanLastReadAtUtc = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Lets the other person's messages flip to "read".
        await _notifier.ConversationReadAsync(
            ChatAccess.OtherParticipant(conversation, userId), conversation.Id, now, cancellationToken);
    }
}
