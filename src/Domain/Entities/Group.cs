using System;

namespace Domain.Entities
{
    public class Group
    {
        public Guid GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public DateTime CreatedAt { get; set; }

        public Client? Client { get; set; }
    }
}
