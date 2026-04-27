using System;

namespace Application.DTOs
{
    public class GroupMemberDto
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsKnownContact { get; set; }
    }

    public class GroupMembersPageDto
    {
        public IReadOnlyList<GroupMemberDto> Items { get; set; } = Array.Empty<GroupMemberDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
