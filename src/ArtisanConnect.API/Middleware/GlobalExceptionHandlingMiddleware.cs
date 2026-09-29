using System.Net;
using System.Text.Json;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Builder;
using ArtisanConnect.Application.Common.Exceptions;
using ArtisanConnect.Application.Common.Models;

namespace ArtisanConnect.API.Middleware;


public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errors) = exception switch
        {
            ValidationException validationException => (
                HttpStatusCode.BadRequest,
                "Validation failed.",
                validationException.Errors.SelectMany(e => e.Value).ToList()),

            NotFoundException notFoundException => (
                HttpStatusCode.NotFound,
                notFoundException.Message,
                new List<string>()),

            ConflictException conflictException => (
                HttpStatusCode.Conflict,
                conflictException.Message,
                new List<string>()),

            BadRequestException badRequestException => (
                HttpStatusCode.BadRequest,
                badRequestException.Message,
                new List<string>()),

            ForbiddenAccessException forbiddenException => (
                HttpStatusCode.Forbidden,
                forbiddenException.Message,
                new List<string>()),

            UnauthorizedAccessException unauthorizedException => (
                HttpStatusCode.Unauthorized,
                unauthorizedException.Message,
                new List<string>()),

            _ => (
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred. Please try again later.",
                new List<string>())
        };


        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception processing {Method} {Path}",
                context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception ({StatusCode}) processing {Method} {Path}",
                statusCode, context.Request.Method, context.Request.Path);
        }

        var response = ApiResponse<object>.FailureResponse(
            message: statusCode == HttpStatusCode.InternalServerError && !_environment.IsDevelopment()
                ? "An unexpected error occurred. Please try again later."
                : message,
            errors: errors);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}

public static class GlobalExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
    }
}
