using System;

namespace Application.DTOs
{
    public class PartnerDto
    {
        public Guid PartnerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int ClientCount { get; set; }
    }

    public class PartnerAuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public Guid PartnerId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }
}