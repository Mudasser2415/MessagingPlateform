using Domain.Enums;

namespace Domain.Entities
{
    public class Ticket
    {
        public Guid Id { get; set; }

        /// <summary>Auto-generated: INC-20260511-0001 or SR-20260511-0001</summary>
        public string TicketNumber { get; set; } = string.Empty;

        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;

        public DateTime IssueDate { get; set; }
        public string IssueDescription { get; set; } = string.Empty;

        public TicketPriority Priority { get; set; }
        public TicketType TicketType { get; set; }
        public TicketStatus Status { get; set; } = TicketStatus.Open;

        public string? ResolutionDescription { get; set; }
        public SlaStatus SlaStatus { get; set; } = SlaStatus.Met;

        /// <summary>FK to Users — nullable; assigned support agent</summary>
        public Guid? AssignedToUserId { get; set; }

        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation
        public Client? Client { get; set; }
        public User? AssignedTo { get; set; }
    }
}
