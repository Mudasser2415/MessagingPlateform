using System.Text;
using Application.DTOs;
using Application.Features.ClientEmployeeMappings;
using Application.Features.PartnerClients.Queries;
using Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin,Partner,Employee")]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("summary")]
        [ProducesResponseType(typeof(ReportSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ReportSummaryDto>> GetSummary(
            [FromQuery] Guid? clientId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            CancellationToken cancellationToken = default)
        {
            var allowedClientIds = await ResolveAllowedClientIdsAsync(clientId, cancellationToken);
            if (allowedClientIds == ForbiddenClientScope)
            {
                return Forbid();
            }

            var result = await _mediator.Send(new GetReportSummaryQuery
            {
                ClientId = clientId,
                FromDate = fromDate,
                ToDate = toDate,
                AllowedClientIds = allowedClientIds,
            }, cancellationToken);

            return Ok(result);
        }

        [HttpGet("messages")]
        [ProducesResponseType(typeof(ReportPageDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ReportPageDto>> GetMessages(
            [FromQuery] ReportFilterDto filter,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var allowedClientIds = await ResolveAllowedClientIdsAsync(filter.ClientId, cancellationToken);
            if (allowedClientIds == ForbiddenClientScope)
            {
                return Forbid();
            }

            var result = await _mediator.Send(new GetReportMessagesQuery
            {
                ClientId = filter.ClientId,
                Status = filter.Status,
                FromDate = filter.FromDate,
                ToDate = filter.ToDate,
                Page = page,
                PageSize = pageSize,
                AllowedClientIds = allowedClientIds,
            }, cancellationToken);

            return Ok(result);
        }

        [HttpGet("export")]
        [Produces("text/csv")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Export(
            [FromQuery] ReportFilterDto filter,
            CancellationToken cancellationToken = default)
        {
            var allowedClientIds = await ResolveAllowedClientIdsAsync(filter.ClientId, cancellationToken);
            if (allowedClientIds == ForbiddenClientScope)
            {
                return Forbid();
            }

            var csvContent = await _mediator.Send(new ExportReportMessagesQuery
            {
                ClientId = filter.ClientId,
                Status = filter.Status,
                FromDate = filter.FromDate,
                ToDate = filter.ToDate,
                AllowedClientIds = allowedClientIds,
            }, cancellationToken);

            var fileName = $"message-delivery-report-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
            return File(Encoding.UTF8.GetBytes(csvContent), "text/csv", fileName);
        }

        private static readonly Guid[] ForbiddenClientScope = new Guid[] { Guid.Empty };

        private async Task<IReadOnlyCollection<Guid>?> ResolveAllowedClientIdsAsync(Guid? requestedClientId, CancellationToken cancellationToken)
        {
            if (User.IsInRole("Admin"))
            {
                return null;
            }

            IReadOnlyCollection<Guid> allowedClientIds;

            if (User.IsInRole("Partner"))
            {
                var partnerIdClaim = User.FindFirst("partnerId")?.Value;
                if (!Guid.TryParse(partnerIdClaim, out var partnerId))
                {
                    return ForbiddenClientScope;
                }

                var partnerClients = await _mediator.Send(new GetPartnerClientsQuery
                {
                    PartnerId = partnerId,
                }, cancellationToken);

                allowedClientIds = partnerClients.Select(client => client.Id).ToArray();
            }
            else if (User.IsInRole("Employee"))
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return ForbiddenClientScope;
                }

                var assignedClients = await _mediator.Send(new GetAssignedClientsForEmployeeQuery
                {
                    UserId = userId,
                }, cancellationToken);

                allowedClientIds = assignedClients.Select(client => client.ClientId).ToArray();
            }
            else
            {
                return ForbiddenClientScope;
            }

            if (requestedClientId.HasValue && !allowedClientIds.Contains(requestedClientId.Value))
            {
                return ForbiddenClientScope;
            }

            return allowedClientIds;
        }
    }
}