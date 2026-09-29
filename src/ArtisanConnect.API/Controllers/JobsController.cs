using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Jobs.CancelJob;
using ArtisanConnect.Application.Features.Jobs.CreateJob;
using ArtisanConnect.Application.Features.Jobs.GetJobById;
using ArtisanConnect.Application.Features.Jobs.GetMyJobs;
using ArtisanConnect.Application.Features.Jobs.UpdateJob;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtisanConnect.API.Controllers;

[ApiController]
[Route("api/v1/jobs")]
[Authorize]
public class JobsController : ControllerBase
{
    private readonly ISender _mediator;

    public JobsController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Policy = "RequireCustomerRole")]
    [ProducesResponseType(typeof(ApiResponse<JobResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateJobCommand
        {
            Title = request.Title,
            Description = request.Description,
            RequiredTrade = request.RequiredTrade,
            Budget = request.Budget,
            Urgency = request.Urgency,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Address = request.Address
        };

        var result = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetJobById), new { id = result.JobId },
            ApiResponse<JobResult>.SuccessResponse(result, "Job created successfully."));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<JobResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetJobById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetJobByIdQuery { JobId = id }, cancellationToken);

        return Ok(ApiResponse<JobResult>.SuccessResponse(result));
    }

    [HttpGet("my")]
    [Authorize(Policy = "RequireCustomerRole")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<JobResult>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyJobs(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetMyJobsQuery { PageNumber = pageNumber, PageSize = pageSize }, cancellationToken);

        return Ok(ApiResponse<PaginatedList<JobResult>>.SuccessResponse(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireCustomerRole")]
    [ProducesResponseType(typeof(ApiResponse<JobResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateJob(Guid id, [FromBody] UpdateJobRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateJobCommand
        {
            JobId = id,
            Title = request.Title,
            Description = request.Description,
            RequiredTrade = request.RequiredTrade,
            Budget = request.Budget,
            Urgency = request.Urgency,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Address = request.Address
        };

        var result = await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<JobResult>.SuccessResponse(result, "Job updated successfully."));
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Policy = "RequireCustomerRole")]
    [ProducesResponseType(typeof(ApiResponse<JobResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelJob(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CancelJobCommand { JobId = id }, cancellationToken);

        return Ok(ApiResponse<JobResult>.SuccessResponse(result, "Job cancelled successfully."));
    }
}