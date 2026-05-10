using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Commands
{
    /// <summary>
    /// Background job command: marks Draft/Sent quotations as Expired when ValidTo has passed.
    /// </summary>
    public class ExpireQuotationsCommand : IRequest<int> { }

    public class ExpireQuotationsCommandHandler
        : IRequestHandler<ExpireQuotationsCommand, int>
    {
        private readonly IApplicationDbContext _db;

        public ExpireQuotationsCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<int> Handle(
            ExpireQuotationsCommand request,
            CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var expirable = await _db.Quotations
                .Where(q =>
                    (q.Status == QuotationStatus.Draft || q.Status == QuotationStatus.Sent) &&
                    q.ValidTo < now)
                .ToListAsync(cancellationToken);

            foreach (var q in expirable)
            {
                q.Status = QuotationStatus.Expired;
                q.UpdatedAt = now;
            }

            if (expirable.Count > 0)
                await _db.SaveChangesAsync(cancellationToken);

            return expirable.Count;
        }
    }
}
