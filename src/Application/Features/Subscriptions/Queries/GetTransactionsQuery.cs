using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Queries
{
    public class GetTransactionsQuery : IRequest<List<SubscriptionTransactionDto>>
    {
        public Guid? ClientSubscriptionId { get; set; }
        public Guid? ClientId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class GetTransactionsQueryHandler
        : IRequestHandler<GetTransactionsQuery, List<SubscriptionTransactionDto>>
    {
        private readonly IApplicationDbContext _db;

        public GetTransactionsQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<List<SubscriptionTransactionDto>> Handle(
            GetTransactionsQuery request, CancellationToken cancellationToken)
        {
            var query = _db.SubscriptionTransactions
                .AsNoTracking()
                .Include(t => t.ClientSubscription)
                    .ThenInclude(s => s!.Client)
                .Include(t => t.ClientSubscription)
                    .ThenInclude(s => s!.SubscriptionPlan)
                .AsQueryable();

            if (request.ClientSubscriptionId.HasValue)
                query = query.Where(t => t.ClientSubscriptionId == request.ClientSubscriptionId.Value);

            if (request.ClientId.HasValue)
                query = query.Where(t => t.ClientSubscription!.ClientId == request.ClientId.Value);

            var transactions = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return transactions.Select(t => new SubscriptionTransactionDto
            {
                Id = t.Id,
                ClientSubscriptionId = t.ClientSubscriptionId,
                ClientName = t.ClientSubscription?.Client?.Name ?? string.Empty,
                PlanName = t.ClientSubscription?.SubscriptionPlan?.PlanName ?? string.Empty,
                Amount = t.Amount,
                PaymentStatus = t.PaymentStatus.ToString(),
                PaymentMethod = t.PaymentMethod.ToString(),
                TransactionReference = t.TransactionReference,
                PaidAt = t.PaidAt,
                CreatedAt = t.CreatedAt
            }).ToList();
        }
    }
}
