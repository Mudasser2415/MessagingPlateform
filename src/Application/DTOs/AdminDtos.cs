namespace Application.DTOs
{
    public class AdminDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class AdminLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AdminLoginResponse
    {
        public Guid AdminId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }

    public class AdminClientDetailDto
    {
        public Guid Id { get; set; }
        public Guid? PartnerId { get; set; }
        public string? PartnerName { get; set; }
        public string? PartnerCompanyName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int AvailableCredits { get; set; }
        public int GroupCount { get; set; }
        public int MessageCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
