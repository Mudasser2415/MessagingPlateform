using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.GroupMembers.Queries
{
    public class GetGroupMembersQueryHandler : IRequestHandler<GetGroupMembersQuery, List<GroupMemberDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetGroupMembersQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<GroupMemberDto>> Handle(GetGroupMembersQuery request, CancellationToken cancellationToken)
        {
            return await _context.GroupMembers
                .AsNoTracking()
                .ProjectTo<GroupMemberDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}
