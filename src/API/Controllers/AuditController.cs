using Application.DTOs;
using Application.Features.AuditLogs.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/audit")]
    public class AuditController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuditController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(AuditLogPageResponseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<AuditLogPageResponseDto>> GetAuditLogs(
            [FromQuery] string? entityName,
            [FromQuery] string? action,
            [FromQuery] string? performedBy,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new GetAuditLogsQuery
            {
                EntityName = entityName,
                Action = action,
                PerformedBy = performedBy,
                FromDate = fromDate,
                ToDate = toDate,
                Page = page,
                PageSize = pageSize
            }, cancellationToken);

            return Ok(result);
        }
    }
}