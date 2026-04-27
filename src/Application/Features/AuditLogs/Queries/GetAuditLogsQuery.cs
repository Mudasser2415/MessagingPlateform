using Application.DTOs;
using MediatR;

namespace Application.Features.AuditLogs.Queries
{
    public class GetAuditLogsQuery : IRequest<AuditLogPageResponseDto>
    {
        public string? EntityName { get; set; }
        public string? Action { get; set; }
        public string? PerformedBy { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}