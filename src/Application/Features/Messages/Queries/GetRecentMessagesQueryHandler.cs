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

namespace Application.Features.Messages.Queries
{
    public class GetRecentMessagesQueryHandler : IRequestHandler<GetRecentMessagesQuery, List<MessageDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetRecentMessagesQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<MessageDto>> Handle(GetRecentMessagesQuery request, CancellationToken cancellationToken)
        {
            return await _context.Messages
                .AsNoTracking()
                .OrderByDescending(m => m.CreatedAt)
                .Take(request.Count)
                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}
