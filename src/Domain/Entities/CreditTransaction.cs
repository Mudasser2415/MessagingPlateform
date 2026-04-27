using Domain.Enums;

namespace Domain.Entities
{
    public class CreditTransaction
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public CreditTransactionType Type { get; set; }
        public int Amount { get; set; }
        public int BalanceAfter { get; set; }
        public string Reference { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public Client? Client { get; set; }
    }
}