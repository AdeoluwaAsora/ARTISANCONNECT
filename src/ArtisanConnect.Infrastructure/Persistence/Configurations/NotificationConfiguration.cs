using ArtisanConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArtisanConnect.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(1000);

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // A plain reference, not a foreign key: a notification is history and
        // shouldn't block anything that happens to the job later.
        builder.HasIndex(n => n.JobId);

        // The two queries the app runs constantly: "my newest notifications"
        // and "how many unread do I have".
        builder.HasIndex(n => new { n.UserId, n.CreatedAtUtc });
        builder.HasIndex(n => new { n.UserId, n.IsRead });
    }
}
