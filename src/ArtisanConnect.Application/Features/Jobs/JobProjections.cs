using System.Linq.Expressions;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;
using ArtisanConnect.Core.Enums;

namespace ArtisanConnect.Application.Features.Jobs;

/// <summary>
/// The one place a Job becomes a JobResult. It's an expression (not a method)
/// so EF translates it to SQL, including the bid count and artisan name.
/// </summary>
public static class JobProjections
{
    public static readonly Expression<Func<Job, JobResult>> ToResult = j => new JobResult
    {
        JobId = j.Id,
        CustomerId = j.CustomerId,
        Title = j.Title,
        Description = j.Description,
        RequiredTrade = j.RequiredTrade.ToString(),
        BudgetMin = j.BudgetMin,
        BudgetMax = j.BudgetMax,
        Urgency = j.Urgency.ToString(),
        Status = j.Status.ToString(),
        Latitude = j.Location.Y,
        Longitude = j.Location.X,
        Address = j.Address,
        AssignedArtisanId = j.AssignedArtisanId,
        AssignedArtisanName = j.AssignedArtisan == null
            ? null
            : j.AssignedArtisan.FirstName + " " + j.AssignedArtisan.LastName,
        BidCount = j.Bids.Count(b => b.Status != BidStatus.Withdrawn),
        CreatedAtUtc = j.CreatedAtUtc
    };
}
