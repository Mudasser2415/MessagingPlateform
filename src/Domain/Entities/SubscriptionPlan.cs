using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// Defines a reusable subscription plan that can be assigned to clients.
    /// </summary>
    public class SubscriptionPlan
    {
        public Guid Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Billing cycle
        public DurationType DurationType { get; set; }
        public int DurationInDays { get; set; }

        // Pricing & credits
        public decimal Price { get; set; }
        public int IncludedCredits { get; set; }

        // Grace period after expiry (days) before hard-disable
        public int GracePeriodDays { get; set; }

        // Trial plan support
        public bool IsTrial { get; set; }

        // Plan limits
        public int? MaxUsers { get; set; }
        public int? MaxGroups { get; set; }
        public int? MaxTemplates { get; set; }

        // Status
        public bool IsActive { get; set; } = true;

        // Audit
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }

        // Navigation
        public ICollection<ClientSubscription> ClientSubscriptions { get; set; } = new List<ClientSubscription>();
    }
}
