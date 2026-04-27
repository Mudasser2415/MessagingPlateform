using System;

namespace Domain.Entities
{
    public class GroupMember
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsKnownContact { get; set; }

        public Group? Group { get; set; }
    }
}
