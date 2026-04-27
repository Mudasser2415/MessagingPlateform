using MediatR;
using Application.DTOs;

namespace Application.Features.Clients.Queries
{
    public class LoginClientQuery : IRequest<ClientDto>
    {
        public string MobileNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
