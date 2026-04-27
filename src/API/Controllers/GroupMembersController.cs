using Application.DTOs;
using Application.Features.GroupMembers.Commands;
using Application.Features.GroupMembers.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/group-members")]
    public class GroupMembersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GroupMembersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<GroupMemberDto>>> GetGroupMembers()
        {
            var result = await _mediator.Send(new GetGroupMembersQuery());
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateGroupMember([FromBody] CreateGroupMemberCommand command)
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetGroupMembers), new { id = result }, result);
        }

        [Authorize(Roles = "Admin,Employee")]
        [HttpPut("{id}/toggle-known")]
        public async Task<ActionResult<GroupMemberDto>> ToggleKnownContact(
            Guid id,
            [FromBody] UpdateGroupMemberDto dto)
        {
            dto.Id = id;

            var command = new UpdateGroupMemberKnownContactCommand
            {
                Id = dto.Id,
                IsKnownContact = dto.IsKnownContact
            };

            var result = await _mediator.Send(command);
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGroupMember(Guid id)
        {
            var result = await _mediator.Send(new DeleteGroupMemberCommand { Id = id });
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
