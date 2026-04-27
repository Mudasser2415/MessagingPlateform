using Application.DTOs;
using MediatR;

namespace Application.Features.Admins.Queries
{
    public class GetAdminClientByIdQuery : IRequest<AdminClientDetailDto?>
    {
        public Guid ClientId { get; set; }
    }
}