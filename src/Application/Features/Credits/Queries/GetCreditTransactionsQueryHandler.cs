using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Credits.Queries
{
    public class GetCreditTransactionsQueryHandler : IRequestHandler<GetCreditTransactionsQuery, CreditTransactionPageResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public GetCreditTransactionsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CreditTransactionPageResponseDto> Handle(GetCreditTransactionsQuery request, CancellationToken cancellationToken)
        {
            var page = request.Page <= 0 ? 1 : request.Page;
            var pageSize = request.PageSize <= 0 ? 20 : Math.Min(request.PageSize, 100);

            var query = _context.CreditTransactions
                .AsNoTracking()
                .Include(transaction => transaction.Client)
                .AsQueryable();

            if (request.ClientId.HasValue)
            {
                query = query.Where(transaction => transaction.ClientId == request.ClientId.Value);
            }

            if (request.AllowedClientIds is { Count: > 0 })
            {
                query = query.Where(transaction => request.AllowedClientIds.Contains(transaction.ClientId));
            }

            if (request.AllowedClientIds is { Count: 0 })
            {
                return new CreditTransactionPageResponseDto
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = 0,
                    TotalPages = 0,
                };
            }

            if (!string.IsNullOrWhiteSpace(request.Type))
            {
                query = query.Where(transaction => transaction.Type.ToString() == request.Type);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(transaction => transaction.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(transaction => transaction.CreatedAt <= request.ToDate.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(transaction => transaction.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(transaction => new CreditTransactionDto
                {
                    Id = transaction.Id,
                    ClientId = transaction.ClientId,
                    ClientName = transaction.Client != null ? transaction.Client.Name : string.Empty,
                    Type = transaction.Type.ToString(),
                    Amount = transaction.Amount,
                    BalanceAfter = transaction.BalanceAfter,
                    Reference = transaction.Reference,
                    CreatedAt = transaction.CreatedAt,
                })
                .ToListAsync(cancellationToken);

            return new CreditTransactionPageResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize),
            };
        }
    }
}