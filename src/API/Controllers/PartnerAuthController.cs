using Application.DTOs;
using Application.Features.Partners.Commands;
using Application.Features.Partners.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/partner-auth")]
    public class PartnerAuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<PartnerAuthController> _logger;

        public PartnerAuthController(IMediator mediator, ILogger<PartnerAuthController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(PartnerAuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<PartnerAuthResponseDto>> Login([FromBody] PartnerLoginCommand command, CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Partner login attempt received for identifier {Identifier}",
                command.EmailOrMobileNumber);

            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [Authorize(Roles = "Partner")]
        [HttpGet("profile")]
        [ProducesResponseType(typeof(PartnerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<PartnerDto>> GetProfile(CancellationToken cancellationToken)
        {
            var partnerIdClaim = User.FindFirst("partnerId")?.Value;
            if (!Guid.TryParse(partnerIdClaim, out var partnerId))
                return Unauthorized(new { message = "Invalid partner token." });

            var partner = await _mediator.Send(new GetPartnerByIdQuery { PartnerId = partnerId }, cancellationToken);
            if (partner == null)
                return NotFound(new { message = "Partner not found." });

            return Ok(partner);
        }
    }
}