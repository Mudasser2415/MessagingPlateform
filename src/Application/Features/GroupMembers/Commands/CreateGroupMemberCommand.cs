using MediatR;
using System;

namespace Application.Features.GroupMembers.Commands
{
    public class CreateGroupMemberCommand : IRequest<Guid>
    {
        public Guid GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
