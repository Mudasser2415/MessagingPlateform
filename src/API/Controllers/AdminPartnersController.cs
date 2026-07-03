using Application.DTOs;
using Application.Features.Partners.Commands;
using Application.Features.Partners.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/admin/partners")]
    public class AdminPartnersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AdminPartnersController> _logger;

        public AdminPartnersController(IMediator mediator, ILogger<AdminPartnersController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(List<PartnerDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<PartnerDto>>> GetPartners([FromQuery] string? search, CancellationToken cancellationToken)
        {
            var partners = await _mediator.Send(new GetPartnersQuery { Search = search }, cancellationToken);
            return Ok(partners);
        }

        [HttpGet("{partnerId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(PartnerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PartnerDto>> GetPartner(Guid partnerId, CancellationToken cancellationToken)
        {
            var partner = await _mediator.Send(new GetPartnerByIdQuery { PartnerId = partnerId }, cancellationToken);
            if (partner == null)
                return NotFound(new { message = "Partner not found." });

            return Ok(partner);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(PartnerDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PartnerDto>> CreatePartner([FromBody] CreatePartnerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var partner = await _mediator.Send(command, cancellationToken);
                return CreatedAtAction(nameof(GetPartner), new { partnerId = partner.PartnerId }, partner);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Partner creation failed");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a partner");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while processing your request." });
            }
        }

        [HttpPut("{partnerId:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(PartnerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PartnerDto>> UpdatePartner(Guid partnerId, [FromBody] UpdatePartnerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                command.PartnerId = partnerId;
                var partner = await _mediator.Send(command, cancellationToken);
                return Ok(partner);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Partner update failed for {PartnerId}", partnerId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating partner {PartnerId}", partnerId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while processing your request." });
            }
        }
    }
}