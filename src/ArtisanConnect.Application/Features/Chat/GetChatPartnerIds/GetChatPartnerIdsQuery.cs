using MediatR;

namespace ArtisanConnect.Application.Features.Chat.GetChatPartnerIds;

/// <summary>For the ChatHub: everyone UserId has a conversation with (told when UserId goes online/offline).</summary>
public record GetChatPartnerIdsQuery : IRequest<List<Guid>>
{
    public required Guid UserId { get; init; }
}
