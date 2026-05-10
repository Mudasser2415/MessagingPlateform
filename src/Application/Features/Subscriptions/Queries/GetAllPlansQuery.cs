using Application.Common.Interfaces;
using Application.DTOs;
using Application.Features.Subscriptions.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Queries
{
    public class GetAllPlansQuery : IRequest<List<SubscriptionPlanDto>>
    {
        public bool IncludeInactive { get; set; }
    }

    public class GetAllPlansQueryHandler : IRequestHandler<GetAllPlansQuery, List<SubscriptionPlanDto>>
    {
        private readonly IApplicationDbContext _db;

        public GetAllPlansQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<List<SubscriptionPlanDto>> Handle(
            GetAllPlansQuery request, CancellationToken cancellationToken)
        {
            var query = _db.SubscriptionPlans.AsNoTracking();

            if (!request.IncludeInactive)
                query = query.Where(p => p.IsActive);

            var plans = await query.OrderByDescending(p => p.CreatedAt).ToListAsync(cancellationToken);

            return plans.Select(CreateSubscriptionPlanCommandHandler.MapToDto).ToList();
        }
    }
}
