using Domain.Enums;

namespace Application.DTOs
{
    // ── Request DTOs ──────────────────────────────────────────────────────────

    public class CreateTicketDto
    {
        public Guid ClientId { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public string IssueDescription { get; set; } = string.Empty;
        public TicketPriority Priority { get; set; } = TicketPriority.Medium;
        public TicketType TicketType { get; set; } = TicketType.INC;
    }

    public class UpdateTicketDto
    {
        public TicketStatus? Status { get; set; }
        public string? ResolutionDescription { get; set; }
        public Guid? AssignedToUserId { get; set; }
    }

    // ── Response DTOs ─────────────────────────────────────────────────────────

    public class TicketResponseDto
    {
        public Guid TicketId { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public string IssueDescription { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string TicketType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ResolutionDescription { get; set; }
        public string SlaStatus { get; set; } = string.Empty;
        public Guid? AssignedToUserId { get; set; }
        public string? AssignedToName { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class TicketPagedResponseDto
    {
        public List<TicketResponseDto> Items { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    public class TicketQueryDto
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? TicketType { get; set; }
        public string? SlaStatus { get; set; }
        public Guid? ClientId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
