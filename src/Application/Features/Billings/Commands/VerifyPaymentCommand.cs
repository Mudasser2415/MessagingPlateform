using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Billings.Commands
{
    public class VerifyPaymentCommand : IRequest<BillingResponseDto>
    {
        public Guid BillingId { get; set; }
        public string? VerifiedBy { get; set; }
    }

    public class VerifyPaymentCommandHandler : IRequestHandler<VerifyPaymentCommand, BillingResponseDto>
    {
        private readonly IApplicationDbContext _db;

        public VerifyPaymentCommandHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<BillingResponseDto> Handle(VerifyPaymentCommand request, CancellationToken ct)
        {
            var billing = await _db.Billings
                .Include(b => b.Quotation)
                .Include(b => b.Client)
                .Include(b => b.PaymentReferences)
                .FirstOrDefaultAsync(b => b.Id == request.BillingId, ct)
                ?? throw new InvalidOperationException("Billing record not found.");

            if (billing.PaymentStatus == BillingPaymentStatus.Approved)
                throw new InvalidOperationException("Payment is already verified/approved.");

            if (billing.PaymentStatus == BillingPaymentStatus.Rejected)
                throw new InvalidOperationException("Cannot verify a rejected billing.");

            var quotation = billing.Quotation
                ?? throw new InvalidOperationException("Billing has no linked quotation.");

            var client = billing.Client
                ?? await _db.Clients.FindAsync(new object[] { billing.ClientId }, ct)
                ?? throw new InvalidOperationException("Client not found.");

            // Mark billing as approved (legacy verify → maps to Approved status)
            billing.PaymentStatus = BillingPaymentStatus.Approved;
            billing.PaidAmount = billing.TotalAmount;
            billing.VerifiedBy = request.VerifiedBy;
            billing.VerifiedAt = DateTime.UtcNow;
            billing.ApprovedBy = request.VerifiedBy;
            billing.ApprovedAt = DateTime.UtcNow;
            billing.UpdatedAt = DateTime.UtcNow;

            // Allocate credits to client
            client.AvailableCredits += quotation.IncludedCredits;

            var creditTransaction = new CreditTransaction
            {
                Id = Guid.NewGuid(),
                ClientId = billing.ClientId,
                Type = CreditTransactionType.Credit,
                Amount = quotation.IncludedCredits,
                BalanceAfter = client.AvailableCredits,
                Reference = $"Payment verified: {billing.BillingNumber}",
                CreatedAt = DateTime.UtcNow,
            };

            _db.CreditTransactions.Add(creditTransaction);
            await _db.SaveChangesAsync(ct);

            return MapToDto(billing, quotation, client);
        }

        private static BillingResponseDto MapToDto(Billing billing, Quotation quotation, Client client)
        {
            return new BillingResponseDto
            {
                Id = billing.Id,
                BillingNumber = billing.BillingNumber,
                QuotationId = billing.QuotationId,
                QuotationNumber = quotation.QuotationNumber,
                ClientId = billing.ClientId,
                ClientName = client.Name,
                TotalAmount = billing.TotalAmount,
                PaidAmount = billing.PaidAmount,
                PaymentStatus = billing.PaymentStatus.ToString(),
                PaymentMethod = billing.PaymentMethod.ToString(),
                Notes = billing.Notes,
                CreatedBy = billing.CreatedBy,
                CreatedAt = billing.CreatedAt,
                UpdatedAt = billing.UpdatedAt,
                VerifiedBy = billing.VerifiedBy,
                VerifiedAt = billing.VerifiedAt,
                ApprovedBy = billing.ApprovedBy,
                ApprovedAt = billing.ApprovedAt,
                IncludedCredits = quotation.IncludedCredits,
                PaymentReferences = billing.PaymentReferences.Select(p => new PaymentReferenceDto
                {
                    Id = p.Id,
                    BillingId = p.BillingId,
                    FileName = p.FileName,
                    FileUrl = p.FileUrl,
                    FileType = p.FileType,
                    FileSize = p.FileSize,
                    UploadedAt = p.UploadedAt,
                    UploadedBy = p.UploadedBy,
                }).ToList(),
            };
        }
    }
}
