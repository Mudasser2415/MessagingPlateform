using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Commands
{
    public class ApproveQuotationCommand : IRequest<QuotationDto>
    {
        public Guid QuotationId { get; set; }
        public string? ApprovedBy { get; set; }
    }

    public class ApproveQuotationCommandHandler
        : IRequestHandler<ApproveQuotationCommand, QuotationDto>
    {
        private readonly IApplicationDbContext _db;

        public ApproveQuotationCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<QuotationDto> Handle(
            ApproveQuotationCommand request,
            CancellationToken cancellationToken)
        {
            var quotation = await _db.Quotations
                .Include(q => q.Client)
                .Include(q => q.SubscriptionPlan)
                .FirstOrDefaultAsync(q => q.Id == request.QuotationId, cancellationToken)
                ?? throw new KeyNotFoundException($"Quotation {request.QuotationId} not found.");

            if (quotation.Status == QuotationStatus.Approved)
                throw new InvalidOperationException("Quotation is already approved.");

            if (quotation.Status == QuotationStatus.Rejected)
                throw new InvalidOperationException("Rejected quotations cannot be approved.");

            if (DateTime.UtcNow > quotation.ValidTo)
                throw new InvalidOperationException("Quotation has expired and cannot be approved.");

            var client = quotation.Client!;

            // Approval authorizes the commercial offer; credits are activated after payment verification.
            quotation.Status = QuotationStatus.Approved;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            return CreateQuotationCommandHandler.MapToDto(quotation, client.Name, quotation.SubscriptionPlan!);
        }
    }
}
