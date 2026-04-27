using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.GroupMembers.Queries
{
    public class GetGroupMembersByGroupIdQueryHandler : IRequestHandler<GetGroupMembersByGroupIdQuery, GroupMembersPageDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetGroupMembersByGroupIdQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<GroupMembersPageDto> Handle(GetGroupMembersByGroupIdQuery request, CancellationToken cancellationToken)
        {
            var page = request.Page < 1 ? 1 : request.Page;
            var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);
            var searchTerm = request.SearchTerm?.Trim();

            var query = _context.GroupMembers
                .AsNoTracking()
                .Where(member => member.GroupId == request.GroupId);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(member => member.PhoneNumber.Contains(searchTerm));
            }

            if (request.IsKnownContact.HasValue)
            {
                query = query.Where(member => member.IsKnownContact == request.IsKnownContact.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderBy(member => member.PhoneNumber)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<GroupMemberDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return new GroupMembersPageDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize),
            };
        }
    }
}
