using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Billings.Commands
{
    public class RejectBillingCommand : IRequest<BillingResponseDto>
    {
        public Guid BillingId { get; set; }
        public string RejectionReason { get; set; } = string.Empty;
        public string? RejectedBy { get; set; }
    }

    public class RejectBillingCommandHandler : IRequestHandler<RejectBillingCommand, BillingResponseDto>
    {
        private readonly IApplicationDbContext _db;

        public RejectBillingCommandHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<BillingResponseDto> Handle(RejectBillingCommand request, CancellationToken ct)
        {
            var billing = await _db.Billings
                .Include(b => b.Quotation)
                .Include(b => b.Client)
                .Include(b => b.PaymentReferences)
                .FirstOrDefaultAsync(b => b.Id == request.BillingId, ct)
                ?? throw new InvalidOperationException("Billing record not found.");

            if (billing.PaymentStatus == BillingPaymentStatus.Approved)
                throw new InvalidOperationException("Cannot reject a billing that has already been approved.");

            if (billing.PaymentStatus == BillingPaymentStatus.Rejected)
                throw new InvalidOperationException("Billing is already rejected.");

            if (billing.PaymentStatus != BillingPaymentStatus.Pending)
                throw new InvalidOperationException(
                    $"Only Pending billings can be rejected. Current status: {billing.PaymentStatus}.");

            if (string.IsNullOrWhiteSpace(request.RejectionReason))
                throw new InvalidOperationException("A rejection reason is required.");

            var oldStatus = billing.PaymentStatus.ToString();

            billing.PaymentStatus = BillingPaymentStatus.Rejected;
            billing.RejectedBy = request.RejectedBy;
            billing.RejectedAt = DateTime.UtcNow;
            billing.RejectionReason = request.RejectionReason;
            billing.UpdatedAt = DateTime.UtcNow;

            _db.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                EntityName = "Billing",
                EntityId = billing.Id,
                Action = "Reject",
                OldValues = JsonSerializer.Serialize(new { Status = oldStatus }),
                NewValues = JsonSerializer.Serialize(new
                {
                    Status = BillingPaymentStatus.Rejected.ToString(),
                    RejectedBy = request.RejectedBy,
                    RejectionReason = request.RejectionReason,
                }),
                PerformedByName = request.RejectedBy ?? "system",
                Timestamp = DateTime.UtcNow,
            });

            await _db.SaveChangesAsync(ct);

            var quotation = billing.Quotation!;
            var client = billing.Client!;

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
                RejectedBy = billing.RejectedBy,
                RejectedAt = billing.RejectedAt,
                RejectionReason = billing.RejectionReason,
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
