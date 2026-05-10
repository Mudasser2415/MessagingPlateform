using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Commands
{
    public class AssignSubscriptionCommand : IRequest<ClientSubscriptionDto>
    {
        public AssignSubscriptionDto Dto { get; set; } = null!;
        public string? CreatedBy { get; set; }
    }

    public class AssignSubscriptionCommandHandler
        : IRequestHandler<AssignSubscriptionCommand, ClientSubscriptionDto>
    {
        private readonly IApplicationDbContext _db;

        public AssignSubscriptionCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<ClientSubscriptionDto> Handle(
            AssignSubscriptionCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Dto;

            var client = await _db.Clients
                .FirstOrDefaultAsync(c => c.Id == dto.ClientId, cancellationToken)
                ?? throw new KeyNotFoundException($"Client {dto.ClientId} not found.");

            var plan = await _db.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == dto.SubscriptionPlanId && p.IsActive, cancellationToken)
                ?? throw new InvalidOperationException("Subscription plan not found or inactive.");

            // Cancel any existing active subscription for the client
            var existingActive = await _db.ClientSubscriptions
                .Where(s => s.ClientId == dto.ClientId && s.Status == SubscriptionStatus.Active)
                .ToListAsync(cancellationToken);

            foreach (var existing in existingActive)
            {
                existing.Status = SubscriptionStatus.Cancelled;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            var startDate = dto.StartDate?.ToUniversalTime() ?? DateTime.UtcNow;
            var endDate = startDate.AddDays(plan.DurationInDays);

            var subscription = new ClientSubscription
            {
                Id = Guid.NewGuid(),
                ClientId = dto.ClientId,
                SubscriptionPlanId = plan.Id,
                StartDate = startDate,
                EndDate = endDate,
                TrialEndsAt = plan.IsTrial ? startDate.AddDays(plan.DurationInDays) : null,
                Status = SubscriptionStatus.Active,
                TotalCreditsAllocated = plan.IncludedCredits,
                RemainingCredits = plan.IncludedCredits,
                AutoRenew = dto.AutoRenew,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy
            };

            _db.ClientSubscriptions.Add(subscription);

            // Credit the client's available balance
            client.AvailableCredits += plan.IncludedCredits;

            // Create billing transaction
            var transaction = new SubscriptionTransaction
            {
                Id = Guid.NewGuid(),
                ClientSubscriptionId = subscription.Id,
                Amount = plan.Price,
                PaymentStatus = PaymentStatus.Paid,
                PaymentMethod = dto.PaymentMethod,
                TransactionReference = dto.TransactionReference,
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _db.SubscriptionTransactions.Add(transaction);

            await _db.SaveChangesAsync(cancellationToken);

            return MapToDto(subscription, client.Name, plan);
        }

        internal static ClientSubscriptionDto MapToDto(
            ClientSubscription s, string clientName, Domain.Entities.SubscriptionPlan plan)
        {
            var now = DateTime.UtcNow;
            var daysLeft = (int)(s.EndDate - now).TotalDays;
            var inGrace = daysLeft < 0 && Math.Abs(daysLeft) <= plan.GracePeriodDays;

            return new ClientSubscriptionDto
            {
                Id = s.Id,
                ClientId = s.ClientId,
                ClientName = clientName,
                SubscriptionPlanId = s.SubscriptionPlanId,
                PlanName = plan.PlanName,
                DurationType = plan.DurationType.ToString(),
                PlanPrice = plan.Price,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                TrialEndsAt = s.TrialEndsAt,
                Status = s.Status.ToString(),
                TotalCreditsAllocated = s.TotalCreditsAllocated,
                RemainingCredits = s.RemainingCredits,
                AutoRenew = s.AutoRenew,
                LastRenewedAt = s.LastRenewedAt,
                CreatedAt = s.CreatedAt,
                DaysUntilExpiry = daysLeft,
                IsInGracePeriod = inGrace,
                GracePeriodDays = plan.GracePeriodDays
            };
        }
    }
}
