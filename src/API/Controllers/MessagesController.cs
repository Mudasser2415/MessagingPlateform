using Application.DTOs;
using Application.Features.Messages.Commands;
using Application.Features.Messages.Queries;
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
    }
}

