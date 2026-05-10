using System.ComponentModel.DataAnnotations;
using Domain.Enums;

namespace Application.DTOs
{
    // ── Create ────────────────────────────────────────────────────────────────

    public class CreateBillingDto
    {
        [Required]
        public Guid QuotationId { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    // ── Approve ───────────────────────────────────────────────────────────────

    public class ApproveBillingDto
    {
        [MaxLength(1000)]
        public string? ApprovalNotes { get; set; }
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    public class RejectBillingDto
    {
        [Required]
        [MaxLength(500)]
        public string RejectionReason { get; set; } = string.Empty;
    }

    // ── Response ──────────────────────────────────────────────────────────────

    public class BillingResponseDto
    {
        public Guid Id { get; set; }
        public string BillingNumber { get; set; } = string.Empty;
        public Guid QuotationId { get; set; }
        public string QuotationNumber { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Audit
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Approval fields
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovalNotes { get; set; }

        // Rejection fields
        public string? RejectedBy { get; set; }
        public DateTime? RejectedAt { get; set; }
        public string? RejectionReason { get; set; }

        // Legacy
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }

        public List<PaymentReferenceDto> PaymentReferences { get; set; } = new();

        // Derived from quotation
        public int IncludedCredits { get; set; }
    }

    // ── Payment Reference ─────────────────────────────────────────────────────

    public class PaymentReferenceDto
    {
        public Guid Id { get; set; }
        public Guid BillingId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? UploadedBy { get; set; }
    }
}

