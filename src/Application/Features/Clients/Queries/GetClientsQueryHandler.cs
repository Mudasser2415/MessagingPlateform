using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Clients.Queries
{
    public class GetClientsQueryHandler : IRequestHandler<GetClientsQuery, List<ClientDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentRequestContext _currentRequestContext;
        private readonly IMapper _mapper;

        public GetClientsQueryHandler(IApplicationDbContext context, ICurrentRequestContext currentRequestContext, IMapper mapper)
        {
            _context = context;
            _currentRequestContext = currentRequestContext;
            _mapper = mapper;
        }

        public async Task<List<ClientDto>> Handle(GetClientsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Clients.AsNoTracking().AsQueryable();

            if (_currentRequestContext.Role == "Employee")
            {
                if (!_currentRequestContext.UserId.HasValue)
                    throw new UnauthorizedAccessException("Authenticated employee context is required.");

                var userId = _currentRequestContext.UserId.Value;
                query = query.Where(client =>
                    client.CreatedByUserId == userId ||
                    client.ClientEmployeeMappings.Any(mapping => mapping.UserId == userId));
            }

            if (request.PartnerId.HasValue)
            {
                query = query.Where(c => c.PartnerId == request.PartnerId.Value);
            }

            return await query
                .AsNoTracking()
                .ProjectTo<ClientDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}
