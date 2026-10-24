using ArtisanConnect.Application.Common.Models;
using MediatR;

namespace ArtisanConnect.Application.Features.Chat.SendMessage;

public record SendMessageCommand : IRequest<ChatMessageResult>
{
    public required Guid ConversationId { get; init; }
    public required string Content { get; init; }
}
