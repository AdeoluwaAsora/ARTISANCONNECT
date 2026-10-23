using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Bids.AcceptBid;
using ArtisanConnect.Application.Features.Bids.GetBidsForJob;
using ArtisanConnect.Application.Features.Bids.GetMyBids;
using ArtisanConnect.Application.Features.Bids.RejectBid;
using ArtisanConnect.Application.Features.Bids.SubmitBid;
using ArtisanConnect.Application.Features.Bids.UpdateBid;
using ArtisanConnect.Application.Features.Bids.WithdrawBid;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtisanConnect.API.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class BidsController : ControllerBase
{
    private readonly ISender _mediator;

    public BidsController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("jobs/{jobId:guid}/bids")]
    [Authorize(Policy = "RequireArtisanRole")]
    [ProducesResponseType(typeof(ApiResponse<BidResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SubmitBid(Guid jobId, [FromBody] BidRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new SubmitBidCommand
        {
            JobId = jobId,
            Amount = request.Amount,
            EtaMinutes = request.EtaMinutes,
            Message = request.Message
        }, cancellationToken);

        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<BidResult>.SuccessResponse(result, "Bid submitted successfully."));
    }

    [HttpGet("jobs/{jobId:guid}/bids")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<BidResult>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBidsForJob(
        Guid jobId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetBidsForJobQuery { JobId = jobId, PageNumber = pageNumber, PageSize = pageSize }, cancellationToken);

        return Ok(ApiResponse<PaginatedList<BidResult>>.SuccessResponse(result));
    }

    [HttpGet("bids/my")]
    [Authorize(Policy = "RequireArtisanRole")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<BidResult>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyBids(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetMyBidsQuery { PageNumber = pageNumber, PageSize = pageSize }, cancellationToken);

        return Ok(ApiResponse<PaginatedList<BidResult>>.SuccessResponse(result));
    }

    [HttpPut("bids/{id:guid}")]
    [Authorize(Policy = "RequireArtisanRole")]
    [ProducesResponseType(typeof(ApiResponse<BidResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateBid(Guid id, [FromBody] BidRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateBidCommand
        {
            BidId = id,
            Amount = request.Amount,
            EtaMinutes = request.EtaMinutes,
            Message = request.Message
        }, cancellationToken);

        return Ok(ApiResponse<BidResult>.SuccessResponse(result, "Bid updated successfully."));
    }

    [HttpPost("bids/{id:guid}/withdraw")]
    [Authorize(Policy = "RequireArtisanRole")]
    [ProducesResponseType(typeof(ApiResponse<BidResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> WithdrawBid(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new WithdrawBidCommand { BidId = id }, cancellationToken);

        return Ok(ApiResponse<BidResult>.SuccessResponse(result, "Bid withdrawn."));
    }

    [HttpPost("bids/{id:guid}/accept")]
    [Authorize(Policy = "RequireCustomerRole")]
    [ProducesResponseType(typeof(ApiResponse<BidResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AcceptBid(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AcceptBidCommand { BidId = id }, cancellationToken);

        return Ok(ApiResponse<BidResult>.SuccessResponse(result, "Bid accepted. The job is now assigned."));
    }

    [HttpPost("bids/{id:guid}/reject")]
    [Authorize(Policy = "RequireCustomerRole")]
    [ProducesResponseType(typeof(ApiResponse<BidResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RejectBid(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RejectBidCommand { BidId = id }, cancellationToken);

        return Ok(ApiResponse<BidResult>.SuccessResponse(result, "Bid rejected."));
    }
}
