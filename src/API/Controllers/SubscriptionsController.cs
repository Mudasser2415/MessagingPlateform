using Application.DTOs;
using Application.Features.Subscriptions.Commands;
using Application.Features.Subscriptions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    [Authorize]
    public class SubscriptionsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<SubscriptionsController> _logger;

        public SubscriptionsController(IMediator mediator, ILogger<SubscriptionsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // ── Plans ────────────────────────────────────────────────────────────────

        /// <summary>GET /api/subscriptions/plans — returns active plans (all if admin and includeInactive=true)</summary>
        [HttpGet("plans")]
        [Authorize(Roles = "Admin,Partner,Employee")]
        [ProducesResponseType(typeof(List<SubscriptionPlanDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<SubscriptionPlanDto>>> GetPlans(
            [FromQuery] bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            // Only admins may view inactive plans
            var canSeeInactive = User.IsInRole("Admin") && includeInactive;
            var plans = await _mediator.Send(
                new GetAllPlansQuery { IncludeInactive = canSeeInactive }, cancellationToken);
            return Ok(plans);
        }

        /// <summary>POST /api/subscriptions/plans — Admin only</summary>
        [HttpPost("plans")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SubscriptionPlanDto>> CreatePlan(
            [FromBody] CreatePlanDto dto,
            CancellationToken cancellationToken)
        {
            var createdBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
            var result = await _mediator.Send(
                new CreateSubscriptionPlanCommand { Dto = dto, CreatedBy = createdBy },
                cancellationToken);
            return CreatedAtAction(nameof(GetPlans), new { }, result);
        }

        /// <summary>PUT /api/subscriptions/plans/{id} — Admin only</summary>
        [HttpPut("plans/{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SubscriptionPlanDto>> UpdatePlan(
            Guid id,
            [FromBody] UpdatePlanDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var updatedBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new UpdateSubscriptionPlanCommand { PlanId = id, Dto = dto, UpdatedBy = updatedBy },
                    cancellationToken);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ── Client Subscriptions ─────────────────────────────────────────────────

        /// <summary>GET /api/subscriptions — all subscriptions (Admin); supports ?status= and ?search=</summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Partner")]
        [ProducesResponseType(typeof(List<ClientSubscriptionDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ClientSubscriptionDto>>> GetAllSubscriptions(
            [FromQuery] string? status = null,
            [FromQuery] string? search = null,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(
                new GetAllSubscriptionsQuery { StatusFilter = status, Search = search },
                cancellationToken);
            return Ok(result);
        }

        /// <summary>GET /api/subscriptions/client/{clientId}</summary>
        [HttpGet("client/{clientId:guid}")]
        [Authorize(Roles = "Admin,Partner,Employee")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> GetClientSubscription(
            Guid clientId,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetClientSubscriptionQuery { ClientId = clientId }, cancellationToken);
            if (result is null) return NotFound(new { message = $"No subscription found for client {clientId}." });
            return Ok(result);
        }

        /// <summary>POST /api/subscriptions/assign — Admin assigns a plan to a client</summary>
        [HttpPost("assign")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> AssignSubscription(
            [FromBody] AssignSubscriptionDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var createdBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new AssignSubscriptionCommand { Dto = dto, CreatedBy = createdBy },
                    cancellationToken);
                return CreatedAtAction(nameof(GetClientSubscription), new { clientId = dto.ClientId }, result);
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

        /// <summary>POST /api/subscriptions/renew — Admin or self-service renewal</summary>
        [HttpPost("renew")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> RenewSubscription(
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

        /// <summary>POST /api/subscriptions/cancel/{id}</summary>
        [HttpPost("cancel/{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ClientSubscriptionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClientSubscriptionDto>> CancelSubscription(
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

        // ── Transactions ─────────────────────────────────────────────────────────

        /// <summary>GET /api/subscriptions/transactions — Admin billing history</summary>
        [HttpGet("transactions")]
        [Authorize(Roles = "Admin,Partner")]
        [ProducesResponseType(typeof(List<SubscriptionTransactionDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<SubscriptionTransactionDto>>> GetTransactions(
            [FromQuery] Guid? clientSubscriptionId = null,
            [FromQuery] Guid? clientId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetTransactionsQuery
            {
                ClientSubscriptionId = clientSubscriptionId,
                ClientId = clientId,
                PageNumber = page,
                PageSize = pageSize
            }, cancellationToken);
            return Ok(result);
        }

        // ── Dashboard summary ────────────────────────────────────────────────────

        /// <summary>GET /api/subscriptions/summary</summary>
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
