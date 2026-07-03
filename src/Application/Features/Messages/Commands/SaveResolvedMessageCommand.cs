using MediatR;

namespace Application.Features.Messages.Commands
{
    public class SaveResolvedMessageCommand : IRequest<Guid>
    {
        public Guid? Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
    }
}
