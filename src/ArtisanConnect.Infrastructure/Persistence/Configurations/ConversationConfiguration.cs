using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArtisanConnect.Infrastructure.Persistence.Configurations;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("Conversations");

        builder.Property(c => c.LastMessagePreview).HasMaxLength(200);

        builder.HasOne(c => c.Customer)
            .WithMany()
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Artisan)
            .WithMany()
            .HasForeignKey(c => c.ArtisanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Job)
            .WithMany()
            .HasForeignKey(c => c.JobId)
            .OnDelete(DeleteBehavior.SetNull);

        // One conversation per customer–artisan pair. Also stops two quick
        // "start chat" clicks from creating duplicates.
        builder.HasIndex(c => new { c.CustomerId, c.ArtisanId }).IsUnique();
        builder.HasIndex(c => c.ArtisanId);
    }
}
