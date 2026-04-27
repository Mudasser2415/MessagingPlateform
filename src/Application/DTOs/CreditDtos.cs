namespace Application.DTOs
{
    public class AddCreditsDto
    {
        public Guid ClientId { get; set; }
        public int Amount { get; set; }
    }

    public class CreditResponseDto
    {
        public Guid ClientId { get; set; }
        public int AvailableCredits { get; set; }
    }

    public class CreditTransactionDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Amount { get; set; }
        public int BalanceAfter { get; set; }
        public string Reference { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreditTransactionPageResponseDto
    {
        public IReadOnlyList<CreditTransactionDto> Items { get; set; } = Array.Empty<CreditTransactionDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}