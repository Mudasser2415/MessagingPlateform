using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PartnerClients.Queries
{
    public class GetPartnerClientsQueryHandler : IRequestHandler<GetPartnerClientsQuery, List<PartnerClientDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetPartnerClientsQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<PartnerClientDto>> Handle(GetPartnerClientsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Clients
                .AsNoTracking()
                .Where(c => c.PartnerId == request.PartnerId);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(search) ||
                    c.MobileNumber.Contains(search) ||
                    c.EmailId.ToLower().Contains(search));
            }

            return await query
                .OrderByDescending(c => c.CreatedAt)
                .ProjectTo<PartnerClientDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}