using Application.DTOs;
using Application.Features.ClientEmployeeMappings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/client-employee-mapping")]
    public class ClientEmployeeMappingController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ClientEmployeeMappingController> _logger;

        public ClientEmployeeMappingController(IMediator mediator, ILogger<ClientEmployeeMappingController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(MappingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MappingResponseDto>> AssignEmployees(
            [FromBody] CreateMappingDto request,
            CancellationToken cancellationToken)
        {
            try
            {
                var response = await _mediator.Send(new AssignEmployeesToClientCommand
                {
                    ClientId = request.ClientId,
                    UserIds = request.UserIds,
                }, cancellationToken);

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Client employee mapping assignment failed for client {ClientId}", request.ClientId);
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Client employee mapping assignment lookup failed for client {ClientId}", request.ClientId);
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("client/{clientId:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(MappingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MappingResponseDto>> GetMappingsByClient(Guid clientId, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(new GetClientEmployeeMappingsByClientQuery
            {
                ClientId = clientId,
            }, cancellationToken);

            if (response == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            return Ok(response);
        }

        [HttpGet("employee/{userId:guid}")]
        [Authorize(Roles = "Employee")]
        [ProducesResponseType(typeof(List<EmployeeAssignedClientDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<List<EmployeeAssignedClientDto>>> GetClientsForEmployee(Guid userId, CancellationToken cancellationToken)
        {
            var authenticatedUserId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(authenticatedUserId, out var tokenUserId) || tokenUserId != userId)
            {
                return Forbid();
            }

            try
            {
                var response = await _mediator.Send(new GetAssignedClientsForEmployeeQuery
                {
                    UserId = userId,
                }, cancellationToken);

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Assigned client lookup rejected for user {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Assigned client lookup failed for user {UserId}", userId);
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveMapping([FromBody] RemoveClientEmployeeMappingDto request, CancellationToken cancellationToken)
        {
            var removed = await _mediator.Send(new RemoveClientEmployeeMappingCommand
            {
                ClientId = request.ClientId,
                UserId = request.UserId,
            }, cancellationToken);

            if (!removed)
            {
                return NotFound(new { message = "Mapping not found." });
            }

            return NoContent();
        }
    }
}