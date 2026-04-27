using MediatR;
using System;

namespace Application.Features.Clients.Commands
{
    public class CreateClientCommand : IRequest<Guid>
    {
        public Guid? PartnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
