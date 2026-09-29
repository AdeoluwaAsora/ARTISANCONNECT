using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArtisanConnect.Infrastructure.Persistence.Configurations;

public class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.ToTable("Jobs");

        builder.Property(j => j.Title).IsRequired().HasMaxLength(200);
        builder.Property(j => j.Description).IsRequired().HasMaxLength(2000);
        builder.Property(j => j.Address).HasMaxLength(500);

        builder.Property(j => j.Budget).HasPrecision(10, 2);

        builder.Property(j => j.RequiredTrade)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(j => j.Urgency)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(j => j.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(j => j.Location)
            .HasColumnType("geography (Point, 4326)")
            .IsRequired();

        builder.HasOne(j => j.Customer)
            .WithMany()
            .HasForeignKey(j => j.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(j => j.CustomerId);
        builder.HasIndex(j => j.RequiredTrade);
        builder.HasIndex(j => j.Status);
        builder.HasIndex(j => j.Location).HasMethod("GIST");
    }
}