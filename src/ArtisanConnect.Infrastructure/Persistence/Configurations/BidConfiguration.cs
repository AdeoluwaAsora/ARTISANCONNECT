using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArtisanConnect.Infrastructure.Persistence.Configurations;

public class BidConfiguration : IEntityTypeConfiguration<Bid>
{
    public void Configure(EntityTypeBuilder<Bid> builder)
    {
        builder.ToTable("Bids");

        builder.Property(b => b.Amount).HasPrecision(10, 2);
        builder.Property(b => b.Message).IsRequired().HasMaxLength(1000);

        builder.Property(b => b.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(b => b.Job)
            .WithMany(j => j.Bids)
            .HasForeignKey(b => b.JobId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Artisan)
            .WithMany()
            .HasForeignKey(b => b.ArtisanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(b => b.ArtisanId);
        builder.HasIndex(b => b.Status);

        // One active bid per artisan per job. Withdrawn bids don't count, so an
        // artisan can bid again after withdrawing. Enforced in the database too,
        // so two quick submits can't both get through.
        builder.HasIndex(b => new { b.JobId, b.ArtisanId })
            .IsUnique()
            .HasFilter("\"Status\" <> 'Withdrawn' AND NOT \"IsDeleted\"")
            .HasDatabaseName("IX_Bids_JobId_ArtisanId_Active");

        // At most one accepted bid per job. If two accept requests race, the
        // second SaveChanges fails here instead of assigning the job twice.
        builder.HasIndex(b => b.JobId)
            .IsUnique()
            .HasFilter("\"Status\" = 'Accepted' AND NOT \"IsDeleted\"")
            .HasDatabaseName("IX_Bids_JobId_Accepted");
    }
}
