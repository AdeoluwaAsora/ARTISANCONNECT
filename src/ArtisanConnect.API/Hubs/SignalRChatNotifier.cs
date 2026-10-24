using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using Microsoft.AspNetCore.SignalR;

namespace ArtisanConnect.API.Hubs;

/// <summary>
/// IChatNotifier over SignalR. Lives in the API project because the hub does.
/// Delivery is best-effort: a failed push is logged, never turned into an
/// error for a message that was already saved (clients reload on reconnect).
/// </summary>
public class SignalRChatNotifier : IChatNotifier
{
    private readonly IHubContext<ChatHub> _hub;
    private readonly ILogger<SignalRChatNotifier> _logger;

    public SignalRChatNotifier(IHubContext<ChatHub> hub, ILogger<SignalRChatNotifier> logger)
    {
        _hub = hub;
        _logger = logger;
    }

    public async Task MessageSentAsync(
        IReadOnlyCollection<Guid> userIds,
        ChatMessageResult message,
        CancellationToken cancellationToken)
    {
        try
        {
            await _hub.Clients.Users(userIds.Select(id => id.ToString()))
                .SendAsync(ChatHub.ReceiveMessage, message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Couldn't push chat message {MessageId}", message.MessageId);
        }
    }

    public async Task ConversationReadAsync(
        Guid userId,
        Guid conversationId,
        DateTime readAtUtc,
        CancellationToken cancellationToken)
    {
        try
        {
            await _hub.Clients.User(userId.ToString())
                .SendAsync(ChatHub.ConversationRead, conversationId, readAtUtc, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Couldn't push read receipt for conversation {ConversationId}", conversationId);
        }
    }
}
