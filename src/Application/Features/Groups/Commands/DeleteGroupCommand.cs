using MediatR;
using System;

namespace Application.Features.Groups.Commands
{
    public class DeleteGroupCommand : IRequest<bool>
    {
        public Guid GroupId { get; set; }
    }
}
