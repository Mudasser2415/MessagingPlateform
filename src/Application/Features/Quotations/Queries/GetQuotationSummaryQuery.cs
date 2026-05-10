using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Queries
{
    public class GetQuotationSummaryQuery : IRequest<QuotationSummaryDto> { }

    public class GetQuotationSummaryQueryHandler
        : IRequestHandler<GetQuotationSummaryQuery, QuotationSummaryDto>
    {
        private readonly IApplicationDbContext _db;

        public GetQuotationSummaryQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<QuotationSummaryDto> Handle(
            GetQuotationSummaryQuery request,
            CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var quotations = await _db.Quotations
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return new QuotationSummaryDto
            {
                TotalDraft = quotations.Count(q => q.Status == QuotationStatus.Draft),
                TotalSent = quotations.Count(q => q.Status == QuotationStatus.Sent),
                TotalApproved = quotations.Count(q => q.Status == QuotationStatus.Approved),
                TotalRejected = quotations.Count(q => q.Status == QuotationStatus.Rejected),
                TotalExpired = quotations.Count(q => q.Status == QuotationStatus.Expired),
                ExpiringIn7Days = quotations.Count(q =>
                    (q.Status == QuotationStatus.Draft || q.Status == QuotationStatus.Sent) &&
                    q.ValidTo > now && q.ValidTo <= now.AddDays(7)),
                TotalRevenueApproved = quotations
                    .Where(q => q.Status == QuotationStatus.Approved)
                    .Sum(q => q.FinalPrice)
            };
        }
    }
}
