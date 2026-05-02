using Application.DTOs;
using MediatR;
using System;

namespace Application.Features.Messages.Commands
{
    public class SendGroupMessageCommand : IRequest<SendGroupMessageResponse>
    {
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid GroupId { get; set; }
    }
}
