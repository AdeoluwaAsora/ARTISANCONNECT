using ArtisanConnect.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Chat.GetChatPartnerIds;

public class GetChatPartnerIdsQueryHandler : IRequestHandler<GetChatPartnerIdsQuery, List<Guid>>
{
    private readonly IApplicationDbContext _context;

    public GetChatPartnerIdsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Guid>> Handle(GetChatPartnerIdsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Conversations
            .Where(c => c.CustomerId == request.UserId || c.ArtisanId == request.UserId)
            .Select(c => c.CustomerId == request.UserId ? c.ArtisanId : c.CustomerId)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}
