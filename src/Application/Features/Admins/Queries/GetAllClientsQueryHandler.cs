using Application.DTOs;
using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admins.Queries
{
    public class GetAllClientsQueryHandler : IRequestHandler<GetAllClientsQuery, List<AdminClientDetailDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllClientsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminClientDetailDto>> Handle(GetAllClientsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Clients
                .AsNoTracking()
                .Include(c => c.Partner!)
                .ThenInclude(p => p.User)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(searchTerm) ||
                    c.EmailId.ToLower().Contains(searchTerm) ||
                    c.MobileNumber.Contains(searchTerm) ||
                    c.Address.ToLower().Contains(searchTerm) ||
                    c.Location.ToLower().Contains(searchTerm) ||
                    (c.Partner != null && c.Partner.CompanyName.ToLower().Contains(searchTerm)) ||
                    (c.Partner != null && c.Partner.User.Name.ToLower().Contains(searchTerm)));
            }

            // Apply business type filter
            if (!string.IsNullOrWhiteSpace(request.FilterByBusinessType))
            {
                query = query.Where(c => c.BusinessType == request.FilterByBusinessType);
            }

            // Get clients with their related data
            var clients = await query
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(cancellationToken);

            return await AdminClientDetailBuilder.BuildManyAsync(_context, clients, cancellationToken);
        }
    }
}
