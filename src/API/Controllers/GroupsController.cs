using Application.DTOs;
using Application.Features.Groups.Commands;
using Application.Features.Groups.Queries;
using Application.Features.GroupMembers.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/groups")]
    public class GroupsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GroupsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<GroupDto>>> GetGroups()
        {
            var result = await _mediator.Send(new GetGroupsQuery());
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateGroup([FromBody] CreateGroupCommand command)
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetGroups), new { id = result }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateGroup(Guid id, [FromBody] UpdateGroupCommand command)
        {
            command.GroupId = id;
            var result = await _mediator.Send(command);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGroup(Guid id)
        {
            var result = await _mediator.Send(new DeleteGroupCommand { GroupId = id });
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("{id}/members")]
        public async Task<ActionResult<GroupMembersPageDto>> GetGroupMembers(
            Guid id,
            [FromQuery] string? searchTerm,
            [FromQuery] bool? isKnownContact,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _mediator.Send(new GetGroupMembersByGroupIdQuery
            {
                GroupId = id,
                SearchTerm = searchTerm,
                IsKnownContact = isKnownContact,
                Page = page,
                PageSize = pageSize,
            });
            return Ok(result);
        }

        [HttpPost("{id}/members")]
        public async Task<ActionResult> AddGroupMembers(Guid id, [FromBody] AddGroupMembersCommand command)
        {
            command.GroupId = id;
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPut("{id}/members")]
        public async Task<ActionResult> UpdateGroupMembers(Guid id, [FromBody] UpdateGroupMembersCommand command)
        {
            command.GroupId = id;
            var result = await _mediator.Send(command);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
