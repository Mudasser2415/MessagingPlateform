using Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace Application.Features.GroupMembers.Queries
{
    public class GetGroupMembersByGroupIdQuery : IRequest<GroupMembersPageDto>
    {
        public Guid GroupId { get; set; }
        public string? SearchTerm { get; set; }
        public bool? IsKnownContact { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
