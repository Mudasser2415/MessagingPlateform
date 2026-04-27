using Application.DTOs;
using Application.Features.ClientEmployeeMappings;
using Application.Features.Credits.Commands;
using Application.Features.Credits.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreditsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CreditsController> _logger;

        public CreditsController(IMediator mediator, ILogger<CreditsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost("add")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(CreditResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CreditResponseDto>> AddCredits([FromBody] AddCreditsDto request, CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Received credit top-up request for client {ClientId} with amount {Amount}",
                request.ClientId,
                request.Amount);

            var response = await _mediator.Send(new AddCreditsCommand
            {
                ClientId = request.ClientId,
                Amount = request.Amount,
            }, cancellationToken);

            _logger.LogInformation(
                "Credit top-up request completed for client {ClientId}. Available credits {AvailableCredits}",
                response.ClientId,
                response.AvailableCredits);

            return Ok(response);
        }

        [HttpGet("{clientId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(CreditResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CreditResponseDto>> GetClientCredits(Guid clientId, CancellationToken cancellationToken)
        {
            if (User.IsInRole("Employee"))
            {
                var authenticatedUserId = User.FindFirst("userId")?.Value;
                if (!Guid.TryParse(authenticatedUserId, out var userId))
                {
                    return Forbid();
                }

                var assignedClients = await _mediator.Send(new GetAssignedClientsForEmployeeQuery
                {
                    UserId = userId,
                }, cancellationToken);

                if (!assignedClients.Any(client => client.ClientId == clientId))
                {
                    return Forbid();
                }
            }

            var response = await _mediator.Send(new GetClientCreditsQuery
            {
                ClientId = clientId,
            }, cancellationToken);

            if (response == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            return Ok(response);
        }

        [HttpGet("transactions")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(CreditTransactionPageResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<CreditTransactionPageResponseDto>> GetTransactions(
            [FromQuery] Guid? clientId,
            [FromQuery] string? type,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            IReadOnlyCollection<Guid>? allowedClientIds = null;

            if (User.IsInRole("Employee"))
            {
                var authenticatedUserId = User.FindFirst("userId")?.Value;
                if (!Guid.TryParse(authenticatedUserId, out var userId))
                {
                    return Forbid();
                }

                var assignedClients = await _mediator.Send(new GetAssignedClientsForEmployeeQuery
                {
                    UserId = userId,
                }, cancellationToken);

                allowedClientIds = assignedClients.Select(client => client.ClientId).ToArray();

                if (clientId.HasValue && !allowedClientIds.Contains(clientId.Value))
                {
                    return Forbid();
                }
            }

            var response = await _mediator.Send(new GetCreditTransactionsQuery
            {
                ClientId = clientId,
                Type = type,
                FromDate = fromDate,
                ToDate = toDate,
                Page = page,
                PageSize = pageSize,
                AllowedClientIds = allowedClientIds,
            }, cancellationToken);

            return Ok(response);
        }
    }
}