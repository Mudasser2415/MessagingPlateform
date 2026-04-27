using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;

namespace Application.Features.ClientEmployeeMappings
{
    public class GetClientEmployeeMappingsByClientQueryHandler : IRequestHandler<GetClientEmployeeMappingsByClientQuery, MappingResponseDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetClientEmployeeMappingsByClientQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public Task<MappingResponseDto?> Handle(GetClientEmployeeMappingsByClientQuery request, CancellationToken cancellationToken)
        {
            return ClientEmployeeMappingBuilders.BuildClientMappingAsync(_context, request.ClientId, cancellationToken);
        }
    }
}