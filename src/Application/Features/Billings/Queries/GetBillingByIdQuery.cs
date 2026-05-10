using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Billings.Queries
{
    public class GetBillingByIdQuery : IRequest<BillingResponseDto>
    {
        public Guid Id { get; set; }
    }

    public class GetBillingByIdQueryHandler : IRequestHandler<GetBillingByIdQuery, BillingResponseDto>
    {
        private readonly IApplicationDbContext _db;

        public GetBillingByIdQueryHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<BillingResponseDto> Handle(GetBillingByIdQuery request, CancellationToken ct)
        {
            var b = await _db.Billings
                .AsNoTracking()
                .Include(x => x.Quotation)
                .Include(x => x.Client)
                .Include(x => x.PaymentReferences)
                .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
                ?? throw new InvalidOperationException("Billing record not found.");

            return new BillingResponseDto
            {
                Id = b.Id,
                BillingNumber = b.BillingNumber,
                QuotationId = b.QuotationId,
                QuotationNumber = b.Quotation?.QuotationNumber ?? "",
                ClientId = b.ClientId,
                ClientName = b.Client?.Name ?? "",
                TotalAmount = b.TotalAmount,
                PaidAmount = b.PaidAmount,
                PaymentStatus = b.PaymentStatus.ToString(),
                PaymentMethod = b.PaymentMethod.ToString(),
                Notes = b.Notes,
                CreatedBy = b.CreatedBy,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
                ApprovedBy = b.ApprovedBy,
                ApprovedAt = b.ApprovedAt,
                ApprovalNotes = b.ApprovalNotes,
                RejectedBy = b.RejectedBy,
                RejectedAt = b.RejectedAt,
                RejectionReason = b.RejectionReason,
                VerifiedBy = b.VerifiedBy,
                VerifiedAt = b.VerifiedAt,
                IncludedCredits = b.Quotation?.IncludedCredits ?? 0,
                PaymentReferences = b.PaymentReferences.Select(p => new PaymentReferenceDto
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
