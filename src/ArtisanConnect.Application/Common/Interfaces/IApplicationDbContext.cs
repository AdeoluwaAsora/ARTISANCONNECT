using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<PasswordResetToken> PasswordResetTokens { get; }
    DbSet<Job> Jobs { get; }
    DbSet<ArtisanProfile> ArtisanProfiles { get; }
    DbSet<Bid> Bids { get; }
    DbSet<Notification> Notifications { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}