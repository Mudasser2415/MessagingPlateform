using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// Records an active or historical subscription for a specific client.
    /// </summary>
    public class ClientSubscription
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid SubscriptionPlanId { get; set; }

        // Lifecycle dates
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? TrialEndsAt { get; set; }

        // Status
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Pending;

        // Credits
        public int TotalCreditsAllocated { get; set; }
        public int RemainingCredits { get; set; }

        // Renewal
        public bool AutoRenew { get; set; }
        public DateTime? LastRenewedAt { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }

        // Navigation
        public Client? Client { get; set; }
        public SubscriptionPlan? SubscriptionPlan { get; set; }
        public ICollection<SubscriptionTransaction> Transactions { get; set; } = new List<SubscriptionTransaction>();
    }
}
