using Application.DTOs;
using MediatR;

namespace Application.Features.Admins.Queries
{
    public class GetAllClientsQuery : IRequest<List<AdminClientDetailDto>>
    {
        public string? SearchTerm { get; set; }
        public string? FilterByBusinessType { get; set; }
    }
}
