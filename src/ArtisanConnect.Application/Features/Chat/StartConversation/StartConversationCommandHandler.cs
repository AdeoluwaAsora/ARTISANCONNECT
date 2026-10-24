using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Chat.StartConversation;

public class StartConversationCommandHandler : IRequestHandler<StartConversationCommand, ConversationResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPresenceTracker _presence;

    public StartConversationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPresenceTracker presence)
    {
        _context = context;
        _currentUser = currentUser;
        _presence = presence;
    }

    public async Task<ConversationResult> Handle(StartConversationCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
        {
            throw new UnauthorizedAccessException("Not authenticated.");
        }

        var userId = _currentUser.UserId.Value;

        if (request.ParticipantId == userId)
        {
            throw new BadRequestException("You can't start a conversation with yourself.");
        }

        var participant = await _context.Users
            .Where(u => u.Id == request.ParticipantId && u.IsActive)
            .Select(u => new { u.Id, u.Role })
            .FirstOrDefaultAsync(cancellationToken);

        if (participant is null)
        {
            throw new NotFoundException(nameof(User), request.ParticipantId);
        }

        Guid customerId;
        Guid artisanId;

        switch (_currentUser.Role)
        {
            case UserRole.Customer:
                if (participant.Role != UserRole.Artisan)
                {
                    throw new ForbiddenAccessException("Customers can only message artisans.");
                }

                customerId = userId;
                artisanId = participant.Id;

                if (request.JobId is not null)
                {
                    var ownsJob = await _context.Jobs.AnyAsync(
                        j => j.Id == request.JobId && j.CustomerId == userId, cancellationToken);
                    if (!ownsJob)
                    {
                        throw new ForbiddenAccessException("You can only link a chat to one of your own jobs.");
                    }
                }
                break;

            case UserRole.Artisan:
                if (participant.Role != UserRole.Customer)
                {
                    throw new ForbiddenAccessException("Artisans can only message customers.");
                }

                customerId = participant.Id;
                artisanId = userId;

                // Artisans can't cold-message customers: they need a bid (any
                // status) on one of that customer's jobs, or on the given job.
                var hasBid = await _context.Bids.AnyAsync(
                    b => b.ArtisanId == userId
                         && b.Job!.CustomerId == participant.Id
                         && (request.JobId == null || b.JobId == request.JobId),
                    cancellationToken);
                if (!hasBid)
                {
                    throw new ForbiddenAccessException("You can only message customers whose job you've bid on.");
                }
                break;

            default:
                throw new ForbiddenAccessException("Only customers and artisans can use chat.");
        }

        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.CustomerId == customerId && c.ArtisanId == artisanId, cancellationToken);

        if (conversation is null)
        {
            conversation = new Conversation { CustomerId = customerId, ArtisanId = artisanId, JobId = request.JobId };
            _context.Conversations.Add(conversation);
        }
        else if (request.JobId is not null)
        {
            conversation.JobId = request.JobId;
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Both users opened the chat at the same moment; the unique
            // pair index kept one. Use that one.
            conversation = await _context.Conversations
                .FirstAsync(c => c.CustomerId == customerId && c.ArtisanId == artisanId, cancellationToken);
        }

        var result = await _context.Conversations
            .Where(c => c.Id == conversation.Id)
            .Select(ChatProjections.ToResult(userId))
            .FirstAsync(cancellationToken);

        result.IsOnline = _presence.IsOnline(result.ParticipantId);
        return result;
    }
}
