using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Commands
{
    public class UpdateSubscriptionPlanCommand : IRequest<SubscriptionPlanDto>
    {
        public Guid PlanId { get; set; }
        public UpdatePlanDto Dto { get; set; } = null!;
        public string? UpdatedBy { get; set; }
    }

    public class UpdateSubscriptionPlanCommandHandler
        : IRequestHandler<UpdateSubscriptionPlanCommand, SubscriptionPlanDto>
    {
        private readonly IApplicationDbContext _db;

        public UpdateSubscriptionPlanCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<SubscriptionPlanDto> Handle(
            UpdateSubscriptionPlanCommand request,
            CancellationToken cancellationToken)
        {
            var plan = await _db.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == request.PlanId, cancellationToken)
                ?? throw new KeyNotFoundException($"Subscription plan {request.PlanId} not found.");

            var dto = request.Dto;
            int days = dto.DurationType switch
            {
                DurationType.Monthly => 30,
                DurationType.Quarterly => 91,
                DurationType.HalfYearly => 182,
                DurationType.Yearly => 365,
                _ => 30
            };

            plan.PlanName = dto.PlanName;
            plan.Description = dto.Description;
            plan.DurationType = dto.DurationType;
            plan.DurationInDays = days;
            plan.Price = dto.Price;
            plan.IncludedCredits = dto.IncludedCredits;
            plan.GracePeriodDays = dto.GracePeriodDays;
            plan.IsTrial = dto.IsTrial;
            plan.MaxUsers = dto.MaxUsers;
            plan.MaxGroups = dto.MaxGroups;
            plan.MaxTemplates = dto.MaxTemplates;
            plan.IsActive = dto.IsActive;
            plan.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            return CreateSubscriptionPlanCommandHandler.MapToDto(plan);
        }
    }
}
