using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    // ── Plans ──────────────────────────────────────────────────────────────────

    public class CreatePlanDto
    {
        [Required, MaxLength(100)]
        public string PlanName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DurationType DurationType { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int IncludedCredits { get; set; }

        [Range(0, 30)]
        public int GracePeriodDays { get; set; }

        public bool IsTrial { get; set; }
        public int? MaxUsers { get; set; }
        public int? MaxGroups { get; set; }
        public int? MaxTemplates { get; set; }
    }

    public class UpdatePlanDto : CreatePlanDto
    {
        public bool IsActive { get; set; } = true;
    }

    public class SubscriptionPlanDto
    {
        public Guid Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DurationType { get; set; } = string.Empty;
        public int DurationInDays { get; set; }
        public decimal Price { get; set; }
        public int IncludedCredits { get; set; }
        public int GracePeriodDays { get; set; }
        public bool IsTrial { get; set; }
        public int? MaxUsers { get; set; }
        public int? MaxGroups { get; set; }
        public int? MaxTemplates { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // ── Client Subscriptions ───────────────────────────────────────────────────

    public class AssignSubscriptionDto
    {
        [Required]
        public Guid ClientId { get; set; }

        [Required]
        public Guid SubscriptionPlanId { get; set; }

        public DateTime? StartDate { get; set; }
        public bool AutoRenew { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string? TransactionReference { get; set; }
    }

    public class RenewSubscriptionDto
    {
        [Required]
        public Guid ClientSubscriptionId { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string? TransactionReference { get; set; }
    }

    public class ClientSubscriptionDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public Guid SubscriptionPlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string DurationType { get; set; } = string.Empty;
        public decimal PlanPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalCreditsAllocated { get; set; }
        public int RemainingCredits { get; set; }
        public bool AutoRenew { get; set; }
        public DateTime? LastRenewedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int DaysUntilExpiry { get; set; }
        public bool IsInGracePeriod { get; set; }
        public int GracePeriodDays { get; set; }
    }

    // ── Transactions ───────────────────────────────────────────────────────────

    public class SubscriptionTransactionDto
    {
        public Guid Id { get; set; }
        public Guid ClientSubscriptionId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? TransactionReference { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ── Dashboard / Summary ────────────────────────────────────────────────────

    public class SubscriptionSummaryDto
    {
        public int TotalActive { get; set; }
        public int TotalExpired { get; set; }
        public int TotalCancelled { get; set; }
        public int ExpiringIn7Days { get; set; }
        public int ExpiringIn30Days { get; set; }
        public decimal TotalRevenueThisMonth { get; set; }
        public int TotalCreditsAllocatedThisMonth { get; set; }
    }
}
