using MediatR;
using System;
using System.Collections.Generic;

namespace Application.Features.Groups.Commands
{
    /// <summary>
    /// Command to update all group members (replace existing members)
    /// </summary>
    public class UpdateGroupMembersCommand : IRequest<bool>
    {
        public Guid GroupId { get; set; }
        public List<string> PhoneNumbers { get; set; } = new();
    }
}
