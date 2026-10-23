using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Artisans.GetArtisanById;
using ArtisanConnect.Application.Features.Artisans.SearchNearbyArtisans;
using ArtisanConnect.Application.Features.Artisans.UpdateArtisanProfile;
using ArtisanConnect.Core.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtisanConnect.API.Controllers;

[ApiController]
[Route("api/v1/artisans")]
[Authorize(Policy = "RequireArtisanRole")]
public class ArtisansController : ControllerBase
{
    private readonly ISender _mediator;

    public ArtisansController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Artisans near a point, nearest first. Public, so visitors can search
    /// before signing up. Responses include distance, never coordinates.
    /// </summary>
    [HttpGet("nearby")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<ArtisanSummaryResult>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SearchNearby(
        [FromQuery] double? latitude,
        [FromQuery] double? longitude,
        [FromQuery] double radiusKm = SearchNearbyArtisansQuery.DefaultRadiusKm,
        [FromQuery] Trade? trade = null,
        [FromQuery] bool verifiedOnly = false,
        [FromQuery] bool availableOnly = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new SearchNearbyArtisansQuery
        {
            Latitude = latitude,
            Longitude = longitude,
            RadiusKm = radiusKm,
            Trade = trade,
            VerifiedOnly = verifiedOnly,
            AvailableOnly = availableOnly,
            PageNumber = pageNumber,
            PageSize = pageSize
        }, cancellationToken);

        return Ok(ApiResponse<PaginatedList<ArtisanSummaryResult>>.SuccessResponse(result));
    }

    /// <summary>One artisan's public profile; pass latitude/longitude to get a distance.</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<ArtisanSummaryResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromQuery] double? latitude,
        [FromQuery] double? longitude,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetArtisanByIdQuery { ArtisanId = id, Latitude = latitude, Longitude = longitude },
            cancellationToken);

        return Ok(ApiResponse<ArtisanSummaryResult>.SuccessResponse(result));
    }

    [HttpPut("me/profile")]
    [ProducesResponseType(typeof(ApiResponse<UserProfileResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMyArtisanProfile(
        [FromBody] UpdateArtisanProfileRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateArtisanProfileCommand
        {
            Trade = request.Trade,
            YearsOfExperience = request.YearsOfExperience,
            Bio = request.Bio,
            HourlyRate = request.HourlyRate,
            IsAvailable = request.IsAvailable,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            City = request.City
        };

        var result = await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<UserProfileResult>.SuccessResponse(result, "Artisan profile updated successfully."));
    }
}