using MediatR;
using System;

namespace Application.Features.ScheduledMessages.Commands
{
    public class ScheduleMessageCommand : IRequest<Guid>
    {
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime ScheduledAt { get; set; }
    }
}
