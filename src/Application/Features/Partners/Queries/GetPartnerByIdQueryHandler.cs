using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Partners.Queries
{
    public class GetPartnerByIdQueryHandler : IRequestHandler<GetPartnerByIdQuery, PartnerDto?>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentRequestContext _currentRequestContext;

        public GetPartnerByIdQueryHandler(IApplicationDbContext context, ICurrentRequestContext currentRequestContext)
        {
            _context = context;
            _currentRequestContext = currentRequestContext;
        }

        public async Task<PartnerDto?> Handle(GetPartnerByIdQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Partners
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => p.Id == request.PartnerId);

            if (_currentRequestContext.Role == "Employee")
            {
                if (!_currentRequestContext.UserId.HasValue)
                    throw new UnauthorizedAccessException("Authenticated employee context is required.");

                var userId = _currentRequestContext.UserId.Value;
                query = query.Where(partner => partner.CreatedByUserId == userId);
            }

            return await query
                .Select(p => new PartnerDto
                {
                    PartnerId = p.Id,
                    UserId = p.UserId,
                    Name = p.User.Name,
                    Email = p.User.Email ?? string.Empty,
                    MobileNumber = p.User.MobileNumber,
                    CompanyName = p.CompanyName,
                    CompanyAddress = p.CompanyAddress,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    LastLoginAt = p.LastLoginAt,
                    ClientCount = _context.Clients.Count(c => c.PartnerId == p.Id)
                })
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}