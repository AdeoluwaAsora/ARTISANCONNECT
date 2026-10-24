using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Features.Chat.GetChatPartnerIds;
using ArtisanConnect.Application.Features.Chat.GetConversationPeer;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ArtisanConnect.API.Hubs;

/// <summary>
/// Real-time chat channel at /hubs/chat. Sending and reading go through the REST
/// endpoints (so they're validated and saved like everything else); this hub
/// only carries live events. The JWT arrives as ?access_token=..., which
/// Infrastructure's JwtBearer setup already accepts for /hubs paths.
///
/// Server → client events:
///   ReceiveMessage(ChatMessageResult)
///   ConversationRead(conversationId, readAtUtc)
///   UserTyping(conversationId, isTyping)
///   PresenceChanged(userId, isOnline)
/// Client → server: Typing(conversationId, isTyping)
/// </summary>
[Authorize]
public class ChatHub : Hub
{
    public const string ReceiveMessage = "ReceiveMessage";
    public const string ConversationRead = "ConversationRead";
    public const string UserTyping = "UserTyping";
    public const string PresenceChanged = "PresenceChanged";

    private readonly ISender _mediator;
    private readonly IPresenceTracker _presence;

    public ChatHub(ISender mediator, IPresenceTracker presence)
    {
        _mediator = mediator;
        _presence = presence;
    }

    /// <summary>SignalR's user id is the JWT's NameIdentifier claim, i.e. User.Id.</summary>
    private Guid CurrentUserId => Guid.Parse(Context.UserIdentifier!);

    public override async Task OnConnectedAsync()
    {
        var userId = CurrentUserId;
        if (_presence.UserConnected(userId, Context.ConnectionId))
        {
            await BroadcastPresenceAsync(userId, isOnline: true);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = CurrentUserId;
        if (_presence.UserDisconnected(userId, Context.ConnectionId))
        {
            await BroadcastPresenceAsync(userId, isOnline: false);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>Tells the other participant whether this user is typing in the conversation.</summary>
    public async Task Typing(Guid conversationId, bool isTyping)
    {
        Guid peerId;
        try
        {
            peerId = await _mediator.Send(new GetConversationPeerQuery
            {
                ConversationId = conversationId,
                UserId = CurrentUserId
            });
        }
        catch (Exception)
        {
            throw new HubException("Conversation not found.");
        }

        await Clients.User(peerId.ToString()).SendAsync(UserTyping, conversationId, isTyping);
    }

    private async Task BroadcastPresenceAsync(Guid userId, bool isOnline)
    {
        var partnerIds = await _mediator.Send(new GetChatPartnerIdsQuery { UserId = userId });
        if (partnerIds.Count == 0)
        {
            return;
        }

        await Clients.Users(partnerIds.Select(id => id.ToString()))
            .SendAsync(PresenceChanged, userId, isOnline);
    }
}
