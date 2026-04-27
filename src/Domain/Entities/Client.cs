using System;

namespace Domain.Entities
{
    public class Client
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public Guid? PartnerId { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public int AvailableCredits { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
        public DateTime CreatedAt { get; set; }
        public Partner? Partner { get; set; }
        public User? CreatedBy { get; set; }
        public ICollection<ClientEmployeeMapping> ClientEmployeeMappings { get; set; } = new List<ClientEmployeeMapping>();
        public ICollection<CreditTransaction> CreditTransactions { get; set; } = new List<CreditTransaction>();
    }
}
