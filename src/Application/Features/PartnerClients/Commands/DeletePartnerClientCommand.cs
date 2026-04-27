using MediatR;

namespace Application.Features.PartnerClients.Commands
{
    public class DeletePartnerClientCommand : IRequest<bool>
    {
        public Guid PartnerId { get; set; }
        public Guid ClientId { get; set; }
    }
}