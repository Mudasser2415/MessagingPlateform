using Application.Common.Interfaces;
using Application.DTOs;
using Application.Features.Subscriptions.Commands;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Queries
{
    public class GetAllSubscriptionsQuery : IRequest<List<ClientSubscriptionDto>>
    {
        public string? StatusFilter { get; set; }
        public string? Search { get; set; }
    }

    public class GetAllSubscriptionsQueryHandler
        : IRequestHandler<GetAllSubscriptionsQuery, List<ClientSubscriptionDto>>
    {
        private readonly IApplicationDbContext _db;

        public GetAllSubscriptionsQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<List<ClientSubscriptionDto>> Handle(
            GetAllSubscriptionsQuery request, CancellationToken cancellationToken)
        {
            var query = _db.ClientSubscriptions
                .AsNoTracking()
                .Include(s => s.SubscriptionPlan)
                .Include(s => s.Client)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.StatusFilter) &&
                Enum.TryParse<SubscriptionStatus>(request.StatusFilter, true, out var status))
            {
                query = query.Where(s => s.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var term = request.Search.ToLower();
                query = query.Where(s =>
                    s.Client!.Name.ToLower().Contains(term) ||
                    s.SubscriptionPlan!.PlanName.ToLower().Contains(term));
            }

            var subs = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(cancellationToken);

            return subs.Select(s =>
                AssignSubscriptionCommandHandler.MapToDto(s, s.Client!.Name, s.SubscriptionPlan!))
                .ToList();
        }
    }
}
