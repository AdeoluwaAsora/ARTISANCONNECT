using ArtisanConnect.Application.Common.Interfaces;

namespace ArtisanConnect.Infrastructure.Realtime;

/// <summary>
/// Tracks open ChatHub connections per user. A user with several tabs or
/// devices stays online until the last one closes. Registered as a singleton.
/// </summary>
public class InMemoryPresenceTracker : IPresenceTracker
{
    private readonly Dictionary<Guid, HashSet<string>> _connections = new();
    private readonly object _lock = new();

    public bool IsOnline(Guid userId)
    {
        lock (_lock)
        {
            return _connections.ContainsKey(userId);
        }
    }

    public bool UserConnected(Guid userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_connections.TryGetValue(userId, out var set))
            {
                _connections[userId] = new HashSet<string> { connectionId };
                return true;
            }

            set.Add(connectionId);
            return false;
        }
    }

    public bool UserDisconnected(Guid userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_connections.TryGetValue(userId, out var set))
            {
                return false;
            }

            set.Remove(connectionId);
            if (set.Count > 0)
            {
                return false;
            }

            _connections.Remove(userId);
            return true;
        }
    }
}
