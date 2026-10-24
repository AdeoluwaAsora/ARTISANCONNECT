namespace ArtisanConnect.Core.Enums;

public enum NotificationType
{
    /// <summary>To the customer: an artisan bid on their job.</summary>
    NewBid = 1,

    /// <summary>To the artisan: their bid was accepted and the job is theirs.</summary>
    BidAccepted = 2,

    /// <summary>To the artisan: their bid was rejected, or another bid was accepted.</summary>
    BidRejected = 3,

    /// <summary>To the artisan: the customer cancelled a job they had bid on.</summary>
    JobCancelled = 4

    // Planned once those flows exist: JobCompleted (Contracts), ArtisanVerified (Admin).
}
