using MediatR;
using System;
using System.Collections.Generic;

namespace Application.Features.Groups.Commands
{
    public class AddGroupMembersCommand : IRequest<bool>
    {
        public Guid GroupId { get; set; }
        public List<string> PhoneNumbers { get; set; } = new();
    }
}