using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Credits.Queries
{
    public class GetClientCreditsQueryHandler : IRequestHandler<GetClientCreditsQuery, CreditResponseDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetClientCreditsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CreditResponseDto?> Handle(GetClientCreditsQuery request, CancellationToken cancellationToken)
        {
            return await _context.Clients
                .AsNoTracking()
                .Where(client => client.Id == request.ClientId)
                .Select(client => new CreditResponseDto
                {
                    ClientId = client.Id,
                    AvailableCredits = client.AvailableCredits,
                })
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}