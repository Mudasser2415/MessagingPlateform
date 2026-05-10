using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// Immutable billing record for every credit or payment event linked to a subscription.
    /// </summary>
    public class SubscriptionTransaction
    {
        public Guid Id { get; set; }
        public Guid ClientSubscriptionId { get; set; }

        // Financial
        public decimal Amount { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string? TransactionReference { get; set; }

        // Timestamps
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation
        public ClientSubscription? ClientSubscription { get; set; }
    }
}
