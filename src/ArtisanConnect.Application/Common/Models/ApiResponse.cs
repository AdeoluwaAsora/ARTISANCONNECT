namespace ArtisanConnect.Application.Common.Models;

/// <summary>
/// Every endpoint in the API returns this shape, success or failure.
/// A consistent envelope means the Flutter client can write ONE response
/// parser instead of one per endpoint, and it gives us a stable place to
/// carry cross-cutting metadata (trace id, timestamp) without changing
/// every DTO whenever we add something.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }
    public List<string> Errors { get; init; } = new();
    public DateTime TimestampUtc { get; init; } = DateTime.UtcNow;

    public static ApiResponse<T> SuccessResponse(T data, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message
    };

    public static ApiResponse<T> FailureResponse(string message, List<string>? errors = null) => new()
    {
        Success = false,
        Message = message,
        Errors = errors ?? new List<string>()
    };
}

/// <summary>
/// Non-generic variant for endpoints that don't return a payload
/// (e.g. DELETE, or "logout").
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessMessage(string message) => new()
    {
        Success = true,
        Message = message
    };
}
