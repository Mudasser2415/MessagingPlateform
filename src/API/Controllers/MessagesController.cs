using Application.DTOs;
using Application.Features.Messages.Commands;
using Application.Features.Messages.Queries;
using Application.Features.ScheduledMessages.Commands;
using Application.Features.ScheduledMessages.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MessagesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<MessageDto>>> GetMessages()
        {
            var result = await _mediator.Send(new GetMessagesQuery());
            return Ok(result);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<List<MessageDto>>> GetRecentMessages([FromQuery] int count = 10)
        {
            var result = await _mediator.Send(new GetRecentMessagesQuery { Count = count });
            return Ok(result);
        }

        [HttpGet("saved-templates")]
        public async Task<ActionResult<List<SavedMessageTemplateDto>>> GetSavedMessageTemplates([FromQuery] Guid? clientId = null)
        {
            var result = await _mediator.Send(new GetSavedMessageTemplatesQuery { ClientId = clientId });
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateMessage([FromBody] CreateMessageCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetMessages), new { id = result }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("save-resolved")]
        public async Task<ActionResult<Guid>> SaveResolvedMessage([FromBody] SaveResolvedMessageCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Send a WhatsApp message to all members of a group using a template.
        /// Credits are deducted immediately; messages are queued for async delivery.
        /// </summary>
        [HttpPost("send-group")]
        public async Task<ActionResult<SendGroupMessageResponse>> SendGroupMessage(
            [FromBody] SendGroupMessageCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Schedule a message for future delivery to a group or single number.</summary>
        [HttpPost("schedule")]
        public async Task<ActionResult<Guid>> ScheduleMessage([FromBody] ScheduleMessageCommand command)
        {
            try
            {
                var id = await _mediator.Send(command);
                return Ok(id);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Get all scheduled messages, optionally filtered by client.</summary>
        [HttpGet("scheduled")]
        public async Task<ActionResult<List<ScheduledMessageDto>>> GetScheduledMessages(
            [FromQuery] Guid? clientId = null)
        {
            var result = await _mediator.Send(new GetScheduledMessagesQuery { ClientId = clientId });
            return Ok(result);
        }

        /// <summary>Cancel a pending scheduled message.</summary>
        [HttpDelete("scheduled/{id:guid}")]
        public async Task<IActionResult> CancelScheduledMessage(Guid id)
        {
            try
            {
                await _mediator.Send(new CancelScheduledMessageCommand { Id = id });
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

