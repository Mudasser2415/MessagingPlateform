using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Billings.Commands
{
    public class CreateBillingCommand : IRequest<BillingResponseDto>
    {
        public Guid QuotationId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class CreateBillingCommandHandler : IRequestHandler<CreateBillingCommand, BillingResponseDto>
    {
        private readonly IApplicationDbContext _db;

        public CreateBillingCommandHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<BillingResponseDto> Handle(CreateBillingCommand request, CancellationToken ct)
        {
            // Load quotation and ensure it is Approved
            var quotation = await _db.Quotations
                .Include(q => q.Client)
                .FirstOrDefaultAsync(q => q.Id == request.QuotationId, ct)
                ?? throw new InvalidOperationException("Quotation not found.");

            if (quotation.Status != QuotationStatus.Approved)
                throw new InvalidOperationException("Only Approved quotations can be billed.");

            // Ensure no duplicate billing for the same quotation
            bool alreadyBilled = await _db.Billings.AnyAsync(b => b.QuotationId == request.QuotationId, ct);
            if (alreadyBilled)
                throw new InvalidOperationException("A billing record already exists for this quotation.");

            // Generate billing number: BILL-{year}-{count+1:D4}
            int countThisYear = await _db.Billings
                .CountAsync(b => b.CreatedAt.Year == DateTime.UtcNow.Year, ct);

            string billingNumber = $"BILL-{DateTime.UtcNow.Year}-{(countThisYear + 1):D4}";

            var billing = new Billing
            {
                Id = Guid.NewGuid(),
                BillingNumber = billingNumber,
                QuotationId = request.QuotationId,
                ClientId = quotation.ClientId,
                TotalAmount = quotation.FinalPrice,
                PaidAmount = 0,
                PaymentStatus = BillingPaymentStatus.Pending,
                PaymentMethod = request.PaymentMethod,
                Notes = request.Notes,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow,
            };

            _db.Billings.Add(billing);
            await _db.SaveChangesAsync(ct);

            return new BillingResponseDto
            {
                Id = billing.Id,
                BillingNumber = billing.BillingNumber,
                QuotationId = billing.QuotationId,
                QuotationNumber = quotation.QuotationNumber,
                ClientId = billing.ClientId,
                ClientName = quotation.Client?.Name ?? "",
                TotalAmount = billing.TotalAmount,
                PaidAmount = billing.PaidAmount,
                PaymentStatus = billing.PaymentStatus.ToString(),
                PaymentMethod = billing.PaymentMethod.ToString(),
                Notes = billing.Notes,
                CreatedBy = billing.CreatedBy,
                CreatedAt = billing.CreatedAt,
                IncludedCredits = quotation.IncludedCredits,
            };
        }
    }
}
