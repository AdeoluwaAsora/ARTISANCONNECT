using ArtisanConnect.Application.Common.Models;
using ArtisanConnect.Application.Features.Chat.GetMessages;
using ArtisanConnect.Application.Features.Chat.GetMyConversations;
using ArtisanConnect.Application.Features.Chat.MarkConversationRead;
using ArtisanConnect.Application.Features.Chat.SendMessage;
using ArtisanConnect.Application.Features.Chat.StartConversation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArtisanConnect.API.Controllers;

/// <summary>Chat over REST. Live updates arrive on the SignalR hub at /hubs/chat.</summary>
[ApiController]
[Route("api/v1/conversations")]
[Authorize]
public class ConversationsController : ControllerBase
{
    private readonly ISender _mediator;

    public ConversationsController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Opens (or creates) the conversation with another user.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ConversationResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Start([FromBody] StartConversationRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new StartConversationCommand { ParticipantId = request.ParticipantId, JobId = request.JobId },
            cancellationToken);

        return Ok(ApiResponse<ConversationResult>.SuccessResponse(result));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<ConversationResult>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetMyConversationsQuery { PageNumber = pageNumber, PageSize = pageSize }, cancellationToken);

        return Ok(ApiResponse<PaginatedList<ConversationResult>>.SuccessResponse(result));
    }

    /// <summary>Messages, newest first (page 1 = most recent).</summary>
    [HttpGet("{id:guid}/messages")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<ChatMessageResult>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMessages(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetMessagesQuery { ConversationId = id, PageNumber = pageNumber, PageSize = pageSize },
            cancellationToken);

        return Ok(ApiResponse<PaginatedList<ChatMessageResult>>.SuccessResponse(result));
    }

    [HttpPost("{id:guid}/messages")]
    [ProducesResponseType(typeof(ApiResponse<ChatMessageResult>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage(
        Guid id,
        [FromBody] SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new SendMessageCommand { ConversationId = id, Content = request.Content }, cancellationToken);

        return StatusCode(StatusCodes.Status201Created, ApiResponse<ChatMessageResult>.SuccessResponse(result));
    }

    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new MarkConversationReadCommand { ConversationId = id }, cancellationToken);

        return Ok(ApiResponse.SuccessMessage("Conversation marked as read."));
    }
}
