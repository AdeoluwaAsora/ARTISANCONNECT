using System.Reflection;
using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Core.Common;
using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Infrastructure.Persistence;


public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }


    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<ArtisanProfile> ArtisanProfiles => Set<ArtisanProfile>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // ensure migrations configurations in this assembly are discovered
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());


        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(SetSoftDeleteFilter), BindingFlags.NonPublic | BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);

                method.Invoke(null, new object[] { modelBuilder });
            }
        }

        base.OnModelCreating(modelBuilder);
    }

    private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : BaseEntity
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditableEntities();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditableEntities()
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAtUtc = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
                    break;
            }
        }
    }
}
