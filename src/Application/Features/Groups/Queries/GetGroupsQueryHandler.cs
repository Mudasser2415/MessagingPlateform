using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Groups.Queries
{
    public class GetGroupsQueryHandler : IRequestHandler<GetGroupsQuery, List<GroupDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetGroupsQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<GroupDto>> Handle(GetGroupsQuery request, CancellationToken cancellationToken)
        {
            return await _context.Groups
                .AsNoTracking()
                .Select(group => new GroupDto
                {
                    GroupId = group.GroupId,
                    GroupName = group.GroupName,
                    ClientId = group.ClientId,
                    CreatedAt = group.CreatedAt,
                    MemberCount = _context.GroupMembers.Count(member => member.GroupId == group.GroupId),
                })
                .ToListAsync(cancellationToken);
        }
    }
}
