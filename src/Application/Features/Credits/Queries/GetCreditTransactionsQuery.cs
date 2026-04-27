using Application.DTOs;
using MediatR;

namespace Application.Features.Credits.Queries
{
    public class GetCreditTransactionsQuery : IRequest<CreditTransactionPageResponseDto>
    {
        public Guid? ClientId { get; set; }
        public string? Type { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public IReadOnlyCollection<Guid>? AllowedClientIds { get; set; }
    }
}