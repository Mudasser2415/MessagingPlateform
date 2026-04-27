using Application.DTOs;
using MediatR;
using System;

namespace Application.Features.GroupMembers.Commands
{
    public class UpdateGroupMemberKnownContactCommand : IRequest<GroupMemberDto?>
    {
        public Guid Id { get; set; }
        public bool IsKnownContact { get; set; }
    }
}