using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Billings.Queries
{
    public class GetAllBillingsQuery : IRequest<List<BillingResponseDto>>
    {
        public string? PaymentStatus { get; set; }
        public Guid? ClientId { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class GetAllBillingsQueryHandler : IRequestHandler<GetAllBillingsQuery, List<BillingResponseDto>>
    {
        private readonly IApplicationDbContext _db;

        public GetAllBillingsQueryHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<BillingResponseDto>> Handle(GetAllBillingsQuery request, CancellationToken ct)
        {
            var query = _db.Billings
                .AsNoTracking()
                .Include(b => b.Quotation)
                .Include(b => b.Client)
                .Include(b => b.PaymentReferences)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.PaymentStatus)
                && Enum.TryParse<BillingPaymentStatus>(request.PaymentStatus, true, out var statusFilter))
            {
                query = query.Where(b => b.PaymentStatus == statusFilter);
            }

            if (request.ClientId.HasValue)
                query = query.Where(b => b.ClientId == request.ClientId.Value);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var s = request.Search.Trim().ToLower();
                query = query.Where(b =>
                    b.BillingNumber.ToLower().Contains(s) ||
                    b.Client!.Name.ToLower().Contains(s) ||
                    b.Quotation!.QuotationNumber.ToLower().Contains(s));
            }

            int skip = (request.Page - 1) * request.PageSize;
            var items = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return items.Select(b => new BillingResponseDto
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
            }).ToList();
        }
    }
}
