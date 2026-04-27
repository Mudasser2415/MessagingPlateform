using Application.DTOs;
using MediatR;

namespace Application.Features.PartnerClients.Queries
{
    public class GetPartnerClientByIdQuery : IRequest<PartnerClientDto?>
    {
        public Guid PartnerId { get; set; }
        public Guid ClientId { get; set; }
    }
}