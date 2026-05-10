using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Commands
{
    public class CreateSubscriptionPlanCommand : IRequest<SubscriptionPlanDto>
    {
        public CreatePlanDto Dto { get; set; } = null!;
        public string? CreatedBy { get; set; }
    }

    public class CreateSubscriptionPlanCommandHandler
        : IRequestHandler<CreateSubscriptionPlanCommand, SubscriptionPlanDto>
    {
        private readonly IApplicationDbContext _db;

        public CreateSubscriptionPlanCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<SubscriptionPlanDto> Handle(
            CreateSubscriptionPlanCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Dto;
            int days = dto.DurationType switch
            {
                DurationType.Monthly => 30,
                DurationType.Quarterly => 91,
                DurationType.HalfYearly => 182,
                DurationType.Yearly => 365,
                _ => 30
            };

            var plan = new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                PlanName = dto.PlanName,
                Description = dto.Description,
                DurationType = dto.DurationType,
                DurationInDays = days,
                Price = dto.Price,
                IncludedCredits = dto.IncludedCredits,
                GracePeriodDays = dto.GracePeriodDays,
                IsTrial = dto.IsTrial,
                MaxUsers = dto.MaxUsers,
                MaxGroups = dto.MaxGroups,
                MaxTemplates = dto.MaxTemplates,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy
            };

            _db.SubscriptionPlans.Add(plan);
            await _db.SaveChangesAsync(cancellationToken);

            return MapToDto(plan);
        }

        internal static SubscriptionPlanDto MapToDto(SubscriptionPlan p) => new()
        {
            Id = p.Id,
            PlanName = p.PlanName,
            Description = p.Description,
            DurationType = p.DurationType.ToString(),
            DurationInDays = p.DurationInDays,
            Price = p.Price,
            IncludedCredits = p.IncludedCredits,
            GracePeriodDays = p.GracePeriodDays,
            IsTrial = p.IsTrial,
            MaxUsers = p.MaxUsers,
            MaxGroups = p.MaxGroups,
            MaxTemplates = p.MaxTemplates,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
