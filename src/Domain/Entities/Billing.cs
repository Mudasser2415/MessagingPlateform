using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// Billing record created from an approved Quotation. Tracks payment lifecycle.
    /// </summary>
    public class Billing
    {
        public Guid Id { get; set; }

        /// <summary>Auto-generated reference, e.g. BILL-2026-0001.</summary>
        public string BillingNumber { get; set; } = string.Empty;

        public Guid QuotationId { get; set; }
        public Guid ClientId { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }

        public BillingPaymentStatus PaymentStatus { get; set; } = BillingPaymentStatus.Pending;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

        public string? Notes { get; set; }

        // Audit
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Approval
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovalNotes { get; set; }

        // Rejection
        public string? RejectedBy { get; set; }
        public DateTime? RejectedAt { get; set; }
        public string? RejectionReason { get; set; }

        // Legacy verify (kept for compatibility)
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }

        // Navigation
        public Quotation? Quotation { get; set; }
        public Client? Client { get; set; }
        public ICollection<PaymentReference> PaymentReferences { get; set; } = new List<PaymentReference>();
    }
}
