using Application.DTOs;
using MediatR;

namespace Application.Features.Partners.Queries
{
    public class GetPartnerByIdQuery : IRequest<PartnerDto?>
    {
        public Guid PartnerId { get; set; }
    }
}