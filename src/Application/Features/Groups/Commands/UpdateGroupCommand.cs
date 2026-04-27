using MediatR;
using System;

namespace Application.Features.Groups.Commands
{
    public class UpdateGroupCommand : IRequest<bool>
    {
        public Guid GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
    }
}
