using MediatR;

namespace Application.Features.PartnerClients.Commands
{
    public class UpdatePartnerClientCommand : IRequest<bool>
    {
        public Guid PartnerId { get; set; }
        public Guid ClientId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
    }
}