using System;

namespace Application.DTOs
{
    public class UpdateGroupMemberDto
    {
        public Guid Id { get; set; }
        public bool IsKnownContact { get; set; }
    }
}