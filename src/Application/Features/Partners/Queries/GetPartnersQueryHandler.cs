using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Partners.Queries
{
    public class GetPartnersQueryHandler : IRequestHandler<GetPartnersQuery, List<PartnerDto>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentRequestContext _currentRequestContext;

        public GetPartnersQueryHandler(IApplicationDbContext context, ICurrentRequestContext currentRequestContext)
        {
            _context = context;
            _currentRequestContext = currentRequestContext;
        }

        public async Task<List<PartnerDto>> Handle(GetPartnersQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Partners
                .AsNoTracking()
                .Include(p => p.User)
                .AsQueryable();

            if (_currentRequestContext.Role == "Employee")
            {
                if (!_currentRequestContext.UserId.HasValue)
                    throw new UnauthorizedAccessException("Authenticated employee context is required.");

                var userId = _currentRequestContext.UserId.Value;
                query = query.Where(partner => partner.CreatedByUserId == userId);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                query = query.Where(p =>
                    p.CompanyName.ToLower().Contains(search) ||
                    p.User.Name.ToLower().Contains(search) ||
                    (p.User.Email ?? string.Empty).ToLower().Contains(search) ||
                    p.User.MobileNumber.Contains(search));
            }

            return await query
                .OrderByDescending(p => p.CreatedAt)
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
                .ToListAsync(cancellationToken);
        }
    }
}