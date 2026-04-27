using MediatR;
using System;

namespace Application.Features.Messages.Commands
{
    public class CreateMessageCommand : IRequest<Guid>
    {
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
    }
}
