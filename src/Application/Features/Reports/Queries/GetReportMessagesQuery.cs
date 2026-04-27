using Application.DTOs;
using MediatR;

namespace Application.Features.Reports.Queries
{
    public class GetReportMessagesQuery : IRequest<ReportPageDto>
    {
        public Guid? ClientId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Status { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public IReadOnlyCollection<Guid>? AllowedClientIds { get; set; }
    }
}