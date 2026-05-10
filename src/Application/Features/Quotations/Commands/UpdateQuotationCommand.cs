using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Commands
{
    public class UpdateQuotationCommand : IRequest<QuotationDto>
    {
        public Guid QuotationId { get; set; }
        public UpdateQuotationDto Dto { get; set; } = null!;
        public string? UpdatedBy { get; set; }
    }

    public class UpdateQuotationCommandHandler
        : IRequestHandler<UpdateQuotationCommand, QuotationDto>
    {
        private readonly IApplicationDbContext _db;

        public UpdateQuotationCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<QuotationDto> Handle(
            UpdateQuotationCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Dto;

            var quotation = await _db.Quotations
                .Include(q => q.Client)
                .Include(q => q.SubscriptionPlan)
                .FirstOrDefaultAsync(q => q.Id == request.QuotationId, cancellationToken)
                ?? throw new KeyNotFoundException($"Quotation {request.QuotationId} not found.");

            if (quotation.Status == QuotationStatus.Approved || quotation.Status == QuotationStatus.Rejected)
                throw new InvalidOperationException($"Cannot edit a quotation that is {quotation.Status}.");

            if (dto.ValidTo <= dto.ValidFrom)
                throw new InvalidOperationException("ValidTo must be after ValidFrom.");

            // If plan changed, reload it
            Domain.Entities.SubscriptionPlan plan;
            if (dto.SubscriptionPlanId != quotation.SubscriptionPlanId)
            {
                plan = await _db.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.Id == dto.SubscriptionPlanId && p.IsActive, cancellationToken)
                    ?? throw new InvalidOperationException("Subscription plan not found or inactive.");
                quotation.SubscriptionPlanId = plan.Id;
                quotation.OriginalPrice = plan.Price;
                quotation.IncludedCredits = plan.IncludedCredits;
            }
            else
            {
                plan = quotation.SubscriptionPlan!;
            }

            if (dto.DiscountAmount > quotation.OriginalPrice)
                throw new InvalidOperationException("Discount cannot exceed the plan price.");

            quotation.DiscountAmount = dto.DiscountAmount;
            quotation.FinalPrice = quotation.OriginalPrice - dto.DiscountAmount;
            quotation.ValidFrom = dto.ValidFrom.ToUniversalTime();
            quotation.ValidTo = dto.ValidTo.ToUniversalTime();
            quotation.Notes = dto.Notes;
            quotation.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            return CreateQuotationCommandHandler.MapToDto(quotation, quotation.Client!.Name, plan);
        }
    }
}
