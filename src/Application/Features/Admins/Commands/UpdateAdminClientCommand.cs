using Application.DTOs;
using MediatR;

namespace Application.Features.Admins.Commands
{
    public class UpdateAdminClientCommand : IRequest<AdminClientDetailDto>
    {
        public Guid ClientId { get; set; }
        public Guid? PartnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string? EmailId { get; set; }
    }
}