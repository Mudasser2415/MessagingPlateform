using MediatR;
using System;

namespace Application.Features.GroupMembers.Commands
{
    public class DeleteGroupMemberCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}