using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Commands
{
    public class RejectQuotationCommand : IRequest<QuotationDto>
    {
        public Guid QuotationId { get; set; }
        public string? RejectedBy { get; set; }
    }

    public class RejectQuotationCommandHandler
        : IRequestHandler<RejectQuotationCommand, QuotationDto>
    {
        private readonly IApplicationDbContext _db;

        public RejectQuotationCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<QuotationDto> Handle(
            RejectQuotationCommand request,
            CancellationToken cancellationToken)
        {
            var quotation = await _db.Quotations
                .Include(q => q.Client)
                .Include(q => q.SubscriptionPlan)
                .FirstOrDefaultAsync(q => q.Id == request.QuotationId, cancellationToken)
                ?? throw new KeyNotFoundException($"Quotation {request.QuotationId} not found.");

            if (quotation.Status == QuotationStatus.Rejected)
                throw new InvalidOperationException("Quotation is already rejected.");

            if (quotation.Status == QuotationStatus.Approved)
                throw new InvalidOperationException("Approved quotations cannot be rejected.");

            quotation.Status = QuotationStatus.Rejected;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            return CreateQuotationCommandHandler.MapToDto(
                quotation, quotation.Client!.Name, quotation.SubscriptionPlan!);
        }
    }
}
