using System;

namespace Application.DTOs
{
    public class GroupDto
    {
        public Guid GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MemberCount { get; set; }
    }
}
