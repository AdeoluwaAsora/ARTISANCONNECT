using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArtisanConnect.Infrastructure.Persistence.Configurations;

public class ArtisanProfileConfiguration : IEntityTypeConfiguration<ArtisanProfile>
{
    public void Configure(EntityTypeBuilder<ArtisanProfile> builder)
    {
        builder.ToTable("ArtisanProfiles");

        builder.HasIndex(a => a.UserId).IsUnique();

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(a => a.Trade)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(a => a.Trade);
        builder.HasIndex(a => a.IsVerified);
        builder.Property(a => a.HourlyRate)
            .HasPrecision(10, 2);

        builder.Property(a => a.Bio)
            .HasMaxLength(1000);

        builder.Property(a => a.ProfilePictureUrl)
            .HasMaxLength(2048);
    }
}