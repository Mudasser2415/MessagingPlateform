using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Messages.Queries
{
    public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, List<MessageDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetMessagesQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
        {
            return await _context.Messages
                .AsNoTracking()
                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}
