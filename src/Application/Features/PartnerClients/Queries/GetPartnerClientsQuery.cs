using Application.DTOs;
using MediatR;

namespace Application.Features.PartnerClients.Queries
{
    public class GetPartnerClientsQuery : IRequest<List<PartnerClientDto>>
    {
        public Guid PartnerId { get; set; }
        public string? Search { get; set; }
    }
}