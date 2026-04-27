using Application.DTOs;
using MediatR;

namespace Application.Features.Partners.Commands
{
    public class UpdatePartnerCommand : IRequest<PartnerDto>
    {
        public Guid PartnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}