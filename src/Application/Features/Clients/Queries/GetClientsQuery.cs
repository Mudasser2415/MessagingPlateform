using Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Application.Features.Clients.Queries
{
    public class GetClientsQuery : IRequest<List<ClientDto>>
    {
        public Guid? PartnerId { get; set; }
    }
}
