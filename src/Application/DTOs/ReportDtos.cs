namespace Application.DTOs
{
    public class ReportFilterDto
    {
        public Guid? ClientId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Status { get; set; }
    }

    public class ReportSummaryDto
    {
        public int Total { get; set; }
        public int Sent { get; set; }
        public int Delivered { get; set; }
        public int Failed { get; set; }
        public int Pending { get; set; }
        public decimal SuccessRate { get; set; }
    }

    public class ReportItemDto
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class ReportPageDto
    {
        public IReadOnlyList<ReportItemDto> Items { get; set; } = Array.Empty<ReportItemDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}