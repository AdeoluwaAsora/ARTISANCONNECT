using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Artisans.UpdateArtisanProfile;
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
            IsAvailable = request.IsAvailable
        };

        var result = await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<UserProfileResult>.SuccessResponse(result, "Artisan profile updated successfully."));
    }
}