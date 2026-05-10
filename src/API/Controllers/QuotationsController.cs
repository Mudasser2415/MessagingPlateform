using Application.DTOs;
using Application.Features.Subscriptions.Commands;
using Application.Features.Subscriptions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/quotations")]
    [Authorize]
    public class QuotationsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<QuotationsController> _logger;

        public QuotationsController(IMediator mediator, ILogger<QuotationsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>GET /api/quotations — all client subscriptions/quotations (Admin); supports ?status= and ?search=</summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Partner")]
        [ProducesResponseType(typeof(List<ClientSubscriptionDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ClientSubscriptionDto>>> GetAllQuotations(
            [FromQuery] string? status = null,
            [FromQuery] string? search = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(
                new GetAllSubscriptionsQuery { StatusFilter = status, Search = search },
                cancellationToken);
            return Ok(result);
        }

        /// <summary>GET /api/quotations/client/{clientId}</summary>
        [HttpGet("client/{clientId:guid}")]
        [Authorize(Roles = "Admin,Partner,Employee")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> GetClientQuotation(
            Guid clientId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetClientSubscriptionQuery { ClientId = clientId }, cancellationToken);
            if (result is null)
                return NotFound(new { message = $"No quotation found for client {clientId}." });
            return Ok(result);
        }

        /// <summary>POST /api/quotations/assign — Admin assigns a plan to a client</summary>
        [HttpPost("assign")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> AssignQuotation(
            [FromBody] AssignSubscriptionDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var createdBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new AssignSubscriptionCommand { Dto = dto, CreatedBy = createdBy },
                    cancellationToken);
                return CreatedAtAction(nameof(GetClientQuotation), new { clientId = dto.ClientId }, result);
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

        /// <summary>POST /api/quotations/renew — Renew a client quotation</summary>
        [HttpPost("renew")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> RenewQuotation(
            [FromBody] RenewSubscriptionDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var renewedBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new RenewSubscriptionCommand { Dto = dto, RenewedBy = renewedBy },
                    cancellationToken);
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

        /// <summary>POST /api/quotations/cancel/{id}</summary>
        [HttpPost("cancel/{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> CancelQuotation(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                var cancelledBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new CancelSubscriptionCommand { SubscriptionId = id, CancelledBy = cancelledBy },
                    cancellationToken);
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

        /// <summary>GET /api/quotations/summary</summary>
        [HttpGet("summary")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(SubscriptionSummaryDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<SubscriptionSummaryDto>> GetSummary(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetSubscriptionSummaryQuery(), cancellationToken);
            return Ok(result);
        }
    }
}
