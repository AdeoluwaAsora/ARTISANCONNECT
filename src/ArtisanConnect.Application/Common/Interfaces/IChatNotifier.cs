using ArtisanConnect.Application.Common.Models;

namespace ArtisanConnect.Application.Common.Interfaces;

/// <summary>
/// Pushes chat events to connected clients in real time. Implemented in the
/// API project over the SignalR ChatHub; handlers only call it after their
/// SaveChangesAsync succeeds, so clients never hear about unsaved changes.
/// </summary>
public interface IChatNotifier
{
    /// <summary>"ReceiveMessage": to every open tab of each listed user (sender and recipient).</summary>
    Task MessageSentAsync(IReadOnlyCollection<Guid> userIds, ChatMessageResult message, CancellationToken cancellationToken);

    /// <summary>"ConversationRead": tells the other participant their messages were read, for receipts.</summary>
    Task ConversationReadAsync(Guid userId, Guid conversationId, DateTime readAtUtc, CancellationToken cancellationToken);
}

/// <summary>
/// Which users currently have the app open (a live ChatHub connection).
/// In memory: fine for one API instance; move to Redis if the API is scaled out.
/// </summary>
public interface IPresenceTracker
{
    bool IsOnline(Guid userId);

    /// <summary>Returns true if this is the user's first open connection (they just came online).</summary>
    bool UserConnected(Guid userId, string connectionId);

    /// <summary>Returns true if the user has no connections left (they just went offline).</summary>
    bool UserDisconnected(Guid userId, string connectionId);
}
