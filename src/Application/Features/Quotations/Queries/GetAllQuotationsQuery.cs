using Application.Common.Interfaces;
using Application.DTOs;
using Application.Features.Quotations.Commands;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Queries
{
    public class GetAllQuotationsQuery : IRequest<List<QuotationDto>>
    {
        public string? StatusFilter { get; set; }
        public string? Search { get; set; }
        public Guid? ClientId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class GetAllQuotationsQueryHandler
        : IRequestHandler<GetAllQuotationsQuery, List<QuotationDto>>
    {
        private readonly IApplicationDbContext _db;

        public GetAllQuotationsQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<List<QuotationDto>> Handle(
            GetAllQuotationsQuery request,
            CancellationToken cancellationToken)
        {
            var query = _db.Quotations
                .AsNoTracking()
                .Include(q => q.Client)
                .Include(q => q.SubscriptionPlan)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.StatusFilter) &&
                Enum.TryParse<QuotationStatus>(request.StatusFilter, true, out var status))
            {
                query = query.Where(q => q.Status == status);
            }

            if (request.ClientId.HasValue)
                query = query.Where(q => q.ClientId == request.ClientId.Value);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var term = request.Search.ToLower();
                query = query.Where(q =>
                    q.Client!.Name.ToLower().Contains(term) ||
                    q.QuotationNumber.ToLower().Contains(term) ||
                    q.SubscriptionPlan!.PlanName.ToLower().Contains(term));
            }

            var results = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return results
                .Select(q => CreateQuotationCommandHandler.MapToDto(q, q.Client!.Name, q.SubscriptionPlan!))
                .ToList();
        }
    }
}
