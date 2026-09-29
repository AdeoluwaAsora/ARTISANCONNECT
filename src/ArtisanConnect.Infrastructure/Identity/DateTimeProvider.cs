using ArtisanConnect.Application.Common.Interfaces;

namespace ArtisanConnect.Infrastructure.Identity;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
