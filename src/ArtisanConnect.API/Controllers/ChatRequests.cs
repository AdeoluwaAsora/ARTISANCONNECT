namespace ArtisanConnect.API.Controllers;

public class StartConversationRequest
{
    /// <summary>The other person's user id.</summary>
    public required Guid ParticipantId { get; init; }

    /// <summary>The job the chat is about, if any.</summary>
    public Guid? JobId { get; init; }
}

public class SendMessageRequest
{
    public required string Content { get; init; }
}
