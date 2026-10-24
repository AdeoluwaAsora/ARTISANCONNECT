using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Chat.SendMessage;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, ChatMessageResult>
{
    private const int PreviewLength = 200;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;
    private readonly IChatNotifier _notifier;

    public SendMessageCommandHandler(
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

    public async Task<ChatMessageResult> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var senderId = _currentUser.UserId.Value;
        var conversation = await ChatAccess.GetForParticipantAsync(
            _context, request.ConversationId, senderId, cancellationToken);

        var content = request.Content.Trim();
        var message = new ChatMessage
        {
            ConversationId = conversation.Id,
            SenderId = senderId,
            Content = content
        };
        _context.ChatMessages.Add(message);

        var now = _clock.UtcNow;
        conversation.LastMessageAtUtc = now;
        conversation.LastMessagePreview = content.Length <= PreviewLength
            ? content
            : content[..(PreviewLength - 1)] + "…";

        // Sending a message means you've seen everything before it.
        if (conversation.CustomerId == senderId)
        {
            conversation.CustomerLastReadAtUtc = now;
        }
        else
        {
            conversation.ArtisanLastReadAtUtc = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var result = await _context.ChatMessages
            .Where(m => m.Id == message.Id)
            .Select(ChatProjections.MessageToResult)
            .FirstAsync(cancellationToken);

        // Both users: the recipient gets the message, and the sender's other
        // tabs or devices stay in sync. Clients ignore ids they already have.
        await _notifier.MessageSentAsync(
            new[] { senderId, ChatAccess.OtherParticipant(conversation, senderId) },
            result,
            cancellationToken);

        return result;
    }
}
