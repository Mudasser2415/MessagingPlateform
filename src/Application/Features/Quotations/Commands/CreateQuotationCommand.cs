using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Commands
{
    public class CreateQuotationCommand : IRequest<QuotationDto>
    {
        public CreateQuotationDto Dto { get; set; } = null!;
        public string? CreatedBy { get; set; }
    }

    public class CreateQuotationCommandHandler
        : IRequestHandler<CreateQuotationCommand, QuotationDto>
    {
        private readonly IApplicationDbContext _db;

        public CreateQuotationCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<QuotationDto> Handle(
            CreateQuotationCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Dto;

            if (dto.ValidTo <= dto.ValidFrom)
                throw new InvalidOperationException("ValidTo must be after ValidFrom.");

            var client = await _db.Clients
                .FirstOrDefaultAsync(c => c.Id == dto.ClientId, cancellationToken)
                ?? throw new KeyNotFoundException($"Client {dto.ClientId} not found.");

            var plan = await _db.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == dto.SubscriptionPlanId && p.IsActive, cancellationToken)
                ?? throw new InvalidOperationException("Subscription plan not found or inactive.");

            if (dto.DiscountAmount > plan.Price)
                throw new InvalidOperationException("Discount cannot exceed the plan price.");

            var finalPrice = plan.Price - dto.DiscountAmount;
            var quotationNumber = await GenerateQuotationNumberAsync(cancellationToken);

            var quotation = new Quotation
            {
                Id = Guid.NewGuid(),
                ClientId = dto.ClientId,
                SubscriptionPlanId = plan.Id,
                QuotationNumber = quotationNumber,
                OriginalPrice = plan.Price,
                DiscountAmount = dto.DiscountAmount,
                FinalPrice = finalPrice,
                IncludedCredits = plan.IncludedCredits,
                ValidFrom = dto.ValidFrom.ToUniversalTime(),
                ValidTo = dto.ValidTo.ToUniversalTime(),
                Status = QuotationStatus.Draft,
                Notes = dto.Notes,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            _db.Quotations.Add(quotation);
            await _db.SaveChangesAsync(cancellationToken);

            return MapToDto(quotation, client.Name, plan);
        }

        private async Task<string> GenerateQuotationNumberAsync(CancellationToken ct)
        {
            var today = DateTime.UtcNow.ToString("yyyyMMdd");
            var prefix = $"QT-{today}-";
            var count = await _db.Quotations
                .CountAsync(q => q.QuotationNumber.StartsWith(prefix), ct);
            return $"{prefix}{(count + 1):D4}";
        }

        internal static QuotationDto MapToDto(
            Quotation q, string clientName, Domain.Entities.SubscriptionPlan plan)
        {
            return new QuotationDto
            {
                Id = q.Id,
                QuotationNumber = q.QuotationNumber,
                ClientId = q.ClientId,
                ClientName = clientName,
                SubscriptionPlanId = q.SubscriptionPlanId,
                PlanName = plan.PlanName,
                DurationType = plan.DurationType.ToString(),
                OriginalPrice = q.OriginalPrice,
                DiscountAmount = q.DiscountAmount,
                FinalPrice = q.FinalPrice,
                IncludedCredits = q.IncludedCredits,
                ValidFrom = q.ValidFrom,
                ValidTo = q.ValidTo,
                Status = q.Status.ToString(),
                Notes = q.Notes,
                CreatedBy = q.CreatedBy,
                CreatedAt = q.CreatedAt,
                UpdatedAt = q.UpdatedAt
            };
        }
    }
}
