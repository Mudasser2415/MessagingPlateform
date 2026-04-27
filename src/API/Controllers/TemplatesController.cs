using Application.DTOs;
using Application.Features.Templates.Commands;
using Application.Features.Templates.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TemplatesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TemplatesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<TemplateDto>>> GetTemplates()
        {
            var result = await _mediator.Send(new GetTemplatesQuery());
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TemplateDto>> GetTemplateById(Guid id)
        {
            var result = await _mediator.Send(new GetTemplateByIdQuery { Id = id });
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateTemplate([FromBody] CreateTemplateCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> UpdateTemplate(Guid id, [FromBody] UpdateTemplateCommand command)
        {
            if (id != command.TemplateId)
            {
                return BadRequest("ID mismatch");
            }
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
