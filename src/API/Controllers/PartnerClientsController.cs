using Application.DTOs;
using Application.Features.Clients.Commands;
using Application.Features.PartnerClients.Commands;
using Application.Features.PartnerClients.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Partner")]
    [Route("api/partner/clients")]
    public class PartnerClientsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PartnerClientsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<PartnerClientDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<PartnerClientDto>>> GetClients([FromQuery] string? search, CancellationToken cancellationToken)
        {
            var partnerId = GetPartnerId();
            if (partnerId == null)
                return Unauthorized(new { message = "Invalid partner token." });

            var clients = await _mediator.Send(new GetPartnerClientsQuery
            {
                PartnerId = partnerId.Value,
                Search = search
            }, cancellationToken);

            return Ok(clients);
        }

        [HttpGet("{clientId:guid}")]
        [ProducesResponseType(typeof(PartnerClientDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PartnerClientDto>> GetClient(Guid clientId, CancellationToken cancellationToken)
        {
            var partnerId = GetPartnerId();
            if (partnerId == null)
                return Unauthorized(new { message = "Invalid partner token." });

            var client = await _mediator.Send(new GetPartnerClientByIdQuery
            {
                PartnerId = partnerId.Value,
                ClientId = clientId
            }, cancellationToken);

            if (client == null)
                return NotFound(new { message = "Client not found." });

            return Ok(client);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
        public async Task<ActionResult<Guid>> CreateClient([FromBody] CreateClientCommand command, CancellationToken cancellationToken)
        {
            var partnerId = GetPartnerId();
            if (partnerId == null)
                return Unauthorized(new { message = "Invalid partner token." });

            command.PartnerId = partnerId.Value;
            var result = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetClient), new { clientId = result }, result);
        }

        [HttpPut("{clientId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateClient(Guid clientId, [FromBody] UpdatePartnerClientCommand command, CancellationToken cancellationToken)
        {
            var partnerId = GetPartnerId();
            if (partnerId == null)
                return Unauthorized(new { message = "Invalid partner token." });

            command.ClientId = clientId;
            command.PartnerId = partnerId.Value;

            await _mediator.Send(command, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{clientId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteClient(Guid clientId, CancellationToken cancellationToken)
        {
            var partnerId = GetPartnerId();
            if (partnerId == null)
                return Unauthorized(new { message = "Invalid partner token." });

            var deleted = await _mediator.Send(new DeletePartnerClientCommand
            {
                ClientId = clientId,
                PartnerId = partnerId.Value
            }, cancellationToken);

            if (!deleted)
                return NotFound(new { message = "Client not found." });

            return NoContent();
        }

        private Guid? GetPartnerId()
        {
            var partnerIdClaim = User.FindFirst("partnerId")?.Value;
            return Guid.TryParse(partnerIdClaim, out var partnerId) ? partnerId : null;
        }
    }
}