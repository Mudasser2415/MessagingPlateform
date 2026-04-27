using Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Application.Features.GroupMembers.Queries
{
    public class GetGroupMembersQuery : IRequest<List<GroupMemberDto>>
    {
    }
}
