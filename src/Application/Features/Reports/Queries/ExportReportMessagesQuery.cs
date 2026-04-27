using MediatR;

namespace Application.Features.Reports.Queries
{
    public class ExportReportMessagesQuery : IRequest<string>
    {
        public Guid? ClientId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Status { get; set; }
        public IReadOnlyCollection<Guid>? AllowedClientIds { get; set; }
    }
}