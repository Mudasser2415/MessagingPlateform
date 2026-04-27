using Application.DTOs;
using MediatR;

namespace Application.Features.Reports.Queries
{
    public class GetReportSummaryQuery : IRequest<ReportSummaryDto>
    {
        public Guid? ClientId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public IReadOnlyCollection<Guid>? AllowedClientIds { get; set; }
    }
}