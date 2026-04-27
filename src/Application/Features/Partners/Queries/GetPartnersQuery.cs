using Application.DTOs;
using MediatR;

namespace Application.Features.Partners.Queries
{
    public class GetPartnersQuery : IRequest<List<PartnerDto>>
    {
        public string? Search { get; set; }
    }
}