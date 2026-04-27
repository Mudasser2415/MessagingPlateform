using System;

namespace Application.DTOs
{
    public class ClientDto
    {
        public Guid Id { get; set; }
        public Guid? PartnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int AvailableCredits { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PartnerClientDto
    {
        public Guid Id { get; set; }
        public Guid PartnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public int AvailableCredits { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
