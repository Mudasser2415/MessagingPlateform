using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Partner
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public User User { get; set; } = null!;
        public User? CreatedBy { get; set; }
        public ICollection<Client> Clients { get; set; } = new List<Client>();
    }
}