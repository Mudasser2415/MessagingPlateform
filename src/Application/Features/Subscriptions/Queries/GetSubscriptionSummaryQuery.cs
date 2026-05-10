using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Queries
{
    public class GetSubscriptionSummaryQuery : IRequest<SubscriptionSummaryDto> { }

    public class GetSubscriptionSummaryQueryHandler
        : IRequestHandler<GetSubscriptionSummaryQuery, SubscriptionSummaryDto>
    {
        private readonly IApplicationDbContext _db;

        public GetSubscriptionSummaryQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<SubscriptionSummaryDto> Handle(
            GetSubscriptionSummaryQuery request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var subscriptions = await _db.ClientSubscriptions
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var txThisMonth = await _db.SubscriptionTransactions
                .AsNoTracking()
                .Where(t => t.CreatedAt >= startOfMonth && t.PaymentStatus == PaymentStatus.Paid)
                .ToListAsync(cancellationToken);

            return new SubscriptionSummaryDto
            {
                TotalActive = subscriptions.Count(s => s.Status == SubscriptionStatus.Active),
                TotalExpired = subscriptions.Count(s => s.Status == SubscriptionStatus.Expired),
                TotalCancelled = subscriptions.Count(s => s.Status == SubscriptionStatus.Cancelled),
                ExpiringIn7Days = subscriptions.Count(s =>
                    s.Status == SubscriptionStatus.Active &&
                    s.EndDate > now &&
                    s.EndDate <= now.AddDays(7)),
                ExpiringIn30Days = subscriptions.Count(s =>
                    s.Status == SubscriptionStatus.Active &&
                    s.EndDate > now &&
                    s.EndDate <= now.AddDays(30)),
                TotalRevenueThisMonth = txThisMonth.Sum(t => t.Amount),
                TotalCreditsAllocatedThisMonth = await _db.ClientSubscriptions
                    .AsNoTracking()
                    .Where(s => s.CreatedAt >= startOfMonth)
                    .SumAsync(s => s.TotalCreditsAllocated, cancellationToken)
            };
        }
    }
}
