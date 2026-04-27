using Application.DTOs;
using MediatR;

namespace Application.Features.Partners.Commands
{
    public class PartnerLoginCommand : IRequest<PartnerAuthResponseDto>
    {
        public string EmailOrMobileNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}