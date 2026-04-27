using Application.DTOs;
using Application.Features.Clients.Commands;
using Application.Features.Clients.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin,Employee")]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ClientsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<ClientDto>>> GetClients(CancellationToken cancellationToken)
        {
            try
            {
                var result = await _mediator.Send(new GetClientsQuery(), cancellationToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateClient([FromBody] CreateClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _mediator.Send(command, cancellationToken);
                return CreatedAtAction(nameof(GetClients), new { id = result }, result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
        }
    }
}
