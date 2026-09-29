using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Common.Models;

/// <summary>
/// Every list endpoint (nearby artisans, jobs, bids, notifications...)
/// returns this instead of a bare array. Doing pagination once here
/// means no feature can "forget" it and accidentally return 50,000 rows
/// to a mobile client on a cellular connection.
/// </summary>
public class PaginatedList<T>
{
    public List<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }

    public PaginatedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalCount = count;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        Items = items;
    }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    /// <summary>
    /// Caps page size at 50 server-side. A client asking for pageSize=5000
    /// should not be able to force a full table scan / huge payload -
    /// this is a defensive default, not just a convenience.
    /// </summary>
    public static async Task<PaginatedList<T>> CreateAsync(
        IQueryable<T> source, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        pageNumber = pageNumber < 1 ? 1 : pageNumber;
        pageSize = pageSize is < 1 or > 50 ? 20 : pageSize;

        var count = await source.CountAsync(cancellationToken);
        var items = await source
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
}
