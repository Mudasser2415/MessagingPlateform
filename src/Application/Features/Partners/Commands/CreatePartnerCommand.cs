using Application.DTOs;
using MediatR;

namespace Application.Features.Partners.Commands
{
    public class CreatePartnerCommand : IRequest<PartnerDto>
    {
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}