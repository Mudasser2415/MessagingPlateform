using System;

namespace Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee"; // Admin, Employee, or Partner
        public bool CanCreatePartners { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Partner? Partner { get; set; }
        public ICollection<ClientEmployeeMapping> ClientEmployeeMappings { get; set; } = new List<ClientEmployeeMapping>();
        public ICollection<Client> CreatedClients { get; set; } = new List<Client>();
        public ICollection<Partner> CreatedPartners { get; set; } = new List<Partner>();
    }
}
