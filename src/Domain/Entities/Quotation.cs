using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a custom pricing offer sent to a specific client before credit allocation.
    /// </summary>
    public class Quotation
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid SubscriptionPlanId { get; set; }

        /// <summary>Auto-generated reference number, e.g. QT-20260510-0001.</summary>
        public string QuotationNumber { get; set; } = string.Empty;

        public decimal OriginalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public int IncludedCredits { get; set; }

        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }

        public QuotationStatus Status { get; set; } = QuotationStatus.Draft;

        public string? Notes { get; set; }

        // Audit
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Client? Client { get; set; }
        public SubscriptionPlan? SubscriptionPlan { get; set; }
        public Billing? Billing { get; set; }
    }
}
