using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Billings.Commands
{
    public class ApproveBillingCommand : IRequest<BillingResponseDto>
    {
        public Guid BillingId { get; set; }
        public string? ApprovalNotes { get; set; }
        public string? ApprovedBy { get; set; }
    }

    public class ApproveBillingCommandHandler : IRequestHandler<ApproveBillingCommand, BillingResponseDto>
    {
        private readonly IApplicationDbContext _db;

        public ApproveBillingCommandHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<BillingResponseDto> Handle(ApproveBillingCommand request, CancellationToken ct)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(ct);

            try
            {
                // 1. Load billing with all related data
                var billing = await _db.Billings
                    .Include(b => b.Quotation)
                    .Include(b => b.Client)
                    .Include(b => b.PaymentReferences)
                    .FirstOrDefaultAsync(b => b.Id == request.BillingId, ct)
                    ?? throw new InvalidOperationException("Billing record not found.");

                // 2. Validate status
                if (billing.PaymentStatus != BillingPaymentStatus.Pending)
                    throw new InvalidOperationException(
                        $"Only Pending billings can be approved. Current status: {billing.PaymentStatus}.");

                // 3. Validate payment proof exists
                if (!billing.PaymentReferences.Any())
                    throw new InvalidOperationException(
                        "Cannot approve a billing without at least one payment proof uploaded.");

                var quotation = billing.Quotation
                    ?? throw new InvalidOperationException("Billing has no linked quotation.");

                var client = billing.Client
                    ?? await _db.Clients.FindAsync(new object[] { billing.ClientId }, ct)
                    ?? throw new InvalidOperationException("Client not found.");

                // Capture old values for audit
                var oldStatus = billing.PaymentStatus.ToString();

                // 4. Update billing
                billing.PaymentStatus = BillingPaymentStatus.Approved;
                billing.PaidAmount = billing.TotalAmount;
                billing.ApprovedBy = request.ApprovedBy;
                billing.ApprovedAt = DateTime.UtcNow;
                billing.ApprovalNotes = request.ApprovalNotes;
                billing.UpdatedAt = DateTime.UtcNow;

                // 5. Activate credits for client
                var creditsBefore = client.AvailableCredits;
                client.AvailableCredits += quotation.IncludedCredits;

                // 6. Create credit transaction
                _db.CreditTransactions.Add(new CreditTransaction
                {
                    Id = Guid.NewGuid(),
                    ClientId = billing.ClientId,
                    Type = CreditTransactionType.Credit,
                    Amount = quotation.IncludedCredits,
                    BalanceAfter = client.AvailableCredits,
                    Reference = $"Billing approved: {billing.BillingNumber}",
                    CreatedAt = DateTime.UtcNow,
                });

                // 7. Create audit log
                _db.AuditLogs.Add(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EntityName = "Billing",
                    EntityId = billing.Id,
                    Action = "Approve",
                    OldValues = JsonSerializer.Serialize(new { Status = oldStatus, PaidAmount = billing.PaidAmount }),
                    NewValues = JsonSerializer.Serialize(new
                    {
                        Status = BillingPaymentStatus.Approved.ToString(),
                        PaidAmount = billing.TotalAmount,
                        ApprovedBy = request.ApprovedBy,
                        CreditsActivated = quotation.IncludedCredits,
                        ClientCreditsAfter = client.AvailableCredits,
                    }),
                    PerformedByName = request.ApprovedBy ?? "system",
                    Timestamp = DateTime.UtcNow,
                });

                // 8. Save and commit
                await _db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                return MapToDto(billing, quotation, client);
            }
            catch
            {
                await transaction.RollbackAsync(ct);
                throw;
            }
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
                ApprovedBy = billing.ApprovedBy,
                ApprovedAt = billing.ApprovedAt,
                ApprovalNotes = billing.ApprovalNotes,
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
