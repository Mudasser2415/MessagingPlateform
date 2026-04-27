using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Templates.Queries
{
    public class GetTemplatesQueryHandler : IRequestHandler<GetTemplatesQuery, List<TemplateDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetTemplatesQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<TemplateDto>> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
        {
            return await _context.Templates
                .AsNoTracking()
                .ProjectTo<TemplateDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}
