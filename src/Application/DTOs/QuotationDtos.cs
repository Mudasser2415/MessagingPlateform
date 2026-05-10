using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    // ── Create / Update ──────────────────────────────────────────────────────

    public class CreateQuotationDto
    {
        [Required]
        public Guid ClientId { get; set; }

        [Required]
        public Guid SubscriptionPlanId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Discount cannot be negative.")]
        public decimal DiscountAmount { get; set; } = 0;

        [Required]
        public DateTime ValidFrom { get; set; }

        [Required]
        public DateTime ValidTo { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class UpdateQuotationDto
    {
        public Guid SubscriptionPlanId { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    // ── Response ─────────────────────────────────────────────────────────────

    public class QuotationDto
    {
        public Guid Id { get; set; }
        public string QuotationNumber { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public Guid SubscriptionPlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string DurationType { get; set; } = string.Empty;
        public decimal OriginalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public int IncludedCredits { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsExpired => DateTime.UtcNow > ValidTo;
    }

    // ── Approve ───────────────────────────────────────────────────────────────

    public class ApproveQuotationDto
    {
        [Required]
        public Guid QuotationId { get; set; }
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    public class QuotationSummaryDto
    {
        public int TotalDraft { get; set; }
        public int TotalSent { get; set; }
        public int TotalApproved { get; set; }
        public int TotalRejected { get; set; }
        public int TotalExpired { get; set; }
        public int ExpiringIn7Days { get; set; }
        public decimal TotalRevenueApproved { get; set; }
    }
}
