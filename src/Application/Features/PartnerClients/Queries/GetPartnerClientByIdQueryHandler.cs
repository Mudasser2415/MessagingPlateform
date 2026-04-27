using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PartnerClients.Queries
{
    public class GetPartnerClientByIdQueryHandler : IRequestHandler<GetPartnerClientByIdQuery, PartnerClientDto?>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetPartnerClientByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<PartnerClientDto?> Handle(GetPartnerClientByIdQuery request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.PartnerId == request.PartnerId, cancellationToken);

            return client == null ? null : _mapper.Map<PartnerClientDto>(client);
        }
    }
}