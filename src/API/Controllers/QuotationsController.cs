using Application.DTOs;
using Application.Features.Quotations.Commands;
using Application.Features.Quotations.Queries;
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

        // ── GET ALL ──────────────────────────────────────────────────────────

        /// <summary>GET /api/quotations — supports ?status=, ?search=, ?clientId=, ?page=, ?pageSize=</summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Partner")]
        [ProducesResponseType(typeof(List<QuotationDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<QuotationDto>>> GetAll(
            [FromQuery] string? status = null,
            [FromQuery] string? search = null,
            [FromQuery] Guid? clientId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetAllQuotationsQuery
            {
                StatusFilter = status,
                Search = search,
                ClientId = clientId,
                Page = page,
                PageSize = pageSize
            }, cancellationToken);
            return Ok(result);
        }

        // ── GET BY ID ────────────────────────────────────────────────────────

        /// <summary>GET /api/quotations/{id}</summary>
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Partner,Employee")]
        [ProducesResponseType(typeof(QuotationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<QuotationDto>> GetById(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _mediator.Send(
                    new GetQuotationByIdQuery { QuotationId = id }, cancellationToken);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ── CREATE ───────────────────────────────────────────────────────────

        /// <summary>POST /api/quotations — Admin creates a new quotation</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(QuotationDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<QuotationDto>> Create(
            [FromBody] CreateQuotationDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var createdBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new CreateQuotationCommand { Dto = dto, CreatedBy = createdBy },
                    cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
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

        // ── UPDATE ───────────────────────────────────────────────────────────

        /// <summary>PUT /api/quotations/{id}</summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(QuotationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<QuotationDto>> Update(
            Guid id,
            [FromBody] UpdateQuotationDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var updatedBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new UpdateQuotationCommand { QuotationId = id, Dto = dto, UpdatedBy = updatedBy },
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

        // ── APPROVE ──────────────────────────────────────────────────────────

        /// <summary>POST /api/quotations/{id}/approve — Approve and allocate credits</summary>
        [HttpPost("{id:guid}/approve")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(QuotationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<QuotationDto>> Approve(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                var approvedBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new ApproveQuotationCommand { QuotationId = id, ApprovedBy = approvedBy },
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

        // ── REJECT ───────────────────────────────────────────────────────────

        /// <summary>POST /api/quotations/{id}/reject</summary>
        [HttpPost("{id:guid}/reject")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(QuotationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<QuotationDto>> Reject(
            Guid id,
            CancellationToken cancellationToken)
        {
            try
            {
                var rejectedBy = User.FindFirst("email")?.Value ?? User.FindFirst("sub")?.Value;
                var result = await _mediator.Send(
                    new RejectQuotationCommand { QuotationId = id, RejectedBy = rejectedBy },
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

        // ── SUMMARY ──────────────────────────────────────────────────────────

        /// <summary>GET /api/quotations/summary</summary>
        [HttpGet("summary")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(QuotationSummaryDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<QuotationSummaryDto>> GetSummary(
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetQuotationSummaryQuery(), cancellationToken);
            return Ok(result);
        }
    }
}
