using Application.DTOs;
using Application.Features.Admins.Commands;
using Application.Features.Admins.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IMediator mediator, ILogger<AdminController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Admin login endpoint
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AdminLoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AdminLoginResponse>> Login([FromBody] AdminLoginRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest(new { message = "Email and password are required" });

                var command = new AdminLoginCommand
                {
                    Email = request.Email,
                    Password = request.Password
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin login failed");
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all clients with filters
        /// </summary>
        [HttpGet("clients")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(List<AdminClientDetailDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminClientDetailDto>>> GetAllClients(
            [FromQuery] string? search,
            [FromQuery] string? businessType)
        {
            try
            {
                var query = new GetAllClientsQuery
                {
                    SearchTerm = search,
                    FilterByBusinessType = businessType
                };

                var clients = await _mediator.Send(query);
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching clients");
                return StatusCode(500, new { message = "Error fetching clients" });
            }
        }

        [HttpGet("clients/{clientId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(AdminClientDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AdminClientDetailDto>> GetClientById(Guid clientId, CancellationToken cancellationToken)
        {
            var client = await _mediator.Send(new GetAdminClientByIdQuery
            {
                ClientId = clientId
            }, cancellationToken);

            if (client == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            return Ok(client);
        }

        [HttpPost("clients")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AdminClientDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AdminClientDetailDto>> CreateClient([FromBody] CreateAdminClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var client = await _mediator.Send(command, cancellationToken);
                return CreatedAtAction(nameof(GetClientById), new { clientId = client.Id }, client);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Admin client creation failed");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error creating client" });
            }
        }

        [HttpPut("clients/{clientId:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AdminClientDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AdminClientDetailDto>> UpdateClient(Guid clientId, [FromBody] UpdateAdminClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                command.ClientId = clientId;
                var client = await _mediator.Send(command, cancellationToken);
                return Ok(client);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Admin client update failed for {ClientId}", clientId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client {ClientId}", clientId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error updating client" });
            }
        }

        /// <summary>
        /// Get consolidated stats and widgets for the admin dashboard
        /// </summary>
        [HttpGet("dashboard-stats")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(AdminDashboardStatsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<AdminDashboardStatsDto>> GetDashboardStats(CancellationToken cancellationToken)
        {
            try
            {
                var stats = await _mediator.Send(new GetAdminDashboardStatsQuery(), cancellationToken);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admin dashboard stats");
                return StatusCode(500, new { message = "Error fetching admin dashboard stats" });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { message = "Admin API is healthy" });
        }
    }
}
