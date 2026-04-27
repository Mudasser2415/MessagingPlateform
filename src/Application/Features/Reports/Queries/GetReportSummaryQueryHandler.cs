using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reports.Queries
{
    public class GetReportSummaryQueryHandler : IRequestHandler<GetReportSummaryQuery, ReportSummaryDto>
    {
        private readonly IApplicationDbContext _context;

        public GetReportSummaryQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReportSummaryDto> Handle(GetReportSummaryQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Messages
                .AsNoTracking()
                .ApplyReportFilters(
                    request.ClientId,
                    request.FromDate,
                    request.ToDate,
                    status: null,
                    request.AllowedClientIds);

            var groupedCounts = await query
                .GroupBy(message => 1)
                .Select(group => new
                {
                    Total = group.Count(),
                    Sent = group.Count(message => message.Status == "Sent"),
                    Delivered = group.Count(message => message.Status == "Delivered"),
                    Failed = group.Count(message => message.Status == "Failed"),
                    Pending = group.Count(message => message.Status == "Pending"),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (groupedCounts == null)
            {
                return new ReportSummaryDto();
            }

            return new ReportSummaryDto
            {
                Total = groupedCounts.Total,
                Sent = groupedCounts.Sent,
                Delivered = groupedCounts.Delivered,
                Failed = groupedCounts.Failed,
                Pending = groupedCounts.Pending,
                SuccessRate = groupedCounts.Total == 0
                    ? 0
                    : Math.Round((groupedCounts.Delivered * 100m) / groupedCounts.Total, 2),
            };
        }
    }
}