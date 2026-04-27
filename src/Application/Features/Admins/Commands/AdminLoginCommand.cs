using Application.DTOs;
using MediatR;

namespace Application.Features.Admins.Commands
{
    public class AdminLoginCommand : IRequest<AdminLoginResponse>
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
