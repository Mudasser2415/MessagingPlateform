using MediatR;
using System;
using System.Collections.Generic;

namespace Application.Features.Groups.Commands
{
    public class CreateGroupCommand : IRequest<Guid>
    {
        public string GroupName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public List<string> PhoneNumbers { get; set; } = new();
    }
}
