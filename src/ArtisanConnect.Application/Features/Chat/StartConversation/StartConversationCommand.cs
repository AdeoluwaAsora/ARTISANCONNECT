using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.StartConversation;

/// <summary>
/// Opens the conversation with another user, creating it if needed (one per
/// customer–artisan pair). Customers may message any artisan; artisans may
/// only message customers whose job they've bid on.
/// </summary>
public record StartConversationCommand : IRequest<ConversationResult>
{
    /// <summary>The other person's user id.</summary>
    public required Guid ParticipantId { get; init; }

    /// <summary>The job the chat is about, if any. Becomes the conversation's job tag.</summary>
    public Guid? JobId { get; init; }
}
