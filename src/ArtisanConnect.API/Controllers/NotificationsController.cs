using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Notifications.GetMyNotifications;
using ArtisanConnect.Application.Features.Notifications.GetUnreadCount;
using ArtisanConnect.Application.Features.Notifications.MarkAllNotificationsRead;
using ArtisanConnect.Application.Features.Notifications.MarkNotificationRead;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtisanConnect.API.Controllers;

/// <summary>The signed-in user's own notifications (any role).</summary>
[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ISender _mediator;

    public NotificationsController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<NotificationResult>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetMyNotificationsQuery { UnreadOnly = unreadOnly, PageNumber = pageNumber, PageSize = pageSize },
            cancellationToken);

        return Ok(ApiResponse<PaginatedList<NotificationResult>>.SuccessResponse(result));
    }

    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var count = await _mediator.Send(new GetUnreadCountQuery(), cancellationToken);

        return Ok(ApiResponse<int>.SuccessResponse(count));
    }

    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse<NotificationResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new MarkNotificationReadCommand { NotificationId = id }, cancellationToken);

        return Ok(ApiResponse<NotificationResult>.SuccessResponse(result));
    }

    [HttpPost("read-all")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        var updated = await _mediator.Send(new MarkAllNotificationsReadCommand(), cancellationToken);

        return Ok(ApiResponse<int>.SuccessResponse(updated, $"{updated} notification(s) marked as read."));
    }
}
