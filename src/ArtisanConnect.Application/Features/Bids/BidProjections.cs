using System.Linq.Expressions;
using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Core.Entities;

namespace ArtisanConnect.Application.Features.Bids;

/// <summary>The one place a Bid becomes a BidResult (translated to SQL by EF).</summary>
public static class BidProjections
{
    public static readonly Expression<Func<Bid, BidResult>> ToResult = b => new BidResult
    {
        BidId = b.Id,
        JobId = b.JobId,
        JobTitle = b.Job!.Title,
        ArtisanId = b.ArtisanId,
        ArtisanName = b.Artisan!.FirstName + " " + b.Artisan.LastName,
        Amount = b.Amount,
        EtaMinutes = b.EtaMinutes,
        Message = b.Message,
        Status = b.Status.ToString(),
        CreatedAtUtc = b.CreatedAtUtc,
        UpdatedAtUtc = b.UpdatedAtUtc
    };
}
