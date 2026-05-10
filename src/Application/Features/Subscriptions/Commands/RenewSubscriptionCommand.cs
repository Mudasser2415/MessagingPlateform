using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Commands
{
    public class RenewSubscriptionCommand : IRequest<ClientSubscriptionDto>
    {
        public RenewSubscriptionDto Dto { get; set; } = null!;
        public string? RenewedBy { get; set; }
    }

    public class RenewSubscriptionCommandHandler
        : IRequestHandler<RenewSubscriptionCommand, ClientSubscriptionDto>
    {
        private readonly IApplicationDbContext _db;

        public RenewSubscriptionCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<ClientSubscriptionDto> Handle(
            RenewSubscriptionCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Dto;

            var subscription = await _db.ClientSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Include(s => s.Client)
                .FirstOrDefaultAsync(s => s.Id == dto.ClientSubscriptionId, cancellationToken)
                ?? throw new KeyNotFoundException($"Subscription {dto.ClientSubscriptionId} not found.");

            if (subscription.Status == SubscriptionStatus.Cancelled)
                throw new InvalidOperationException("Cannot renew a cancelled subscription.");

            var plan = subscription.SubscriptionPlan!;
            var client = subscription.Client!;

            // Extend end date from today or current end date whichever is later
            var renewFrom = subscription.EndDate > DateTime.UtcNow
                ? subscription.EndDate
                : DateTime.UtcNow;

            subscription.EndDate = renewFrom.AddDays(plan.DurationInDays);
            subscription.Status = SubscriptionStatus.Active;
            subscription.TotalCreditsAllocated += plan.IncludedCredits;
            subscription.RemainingCredits += plan.IncludedCredits;
            subscription.LastRenewedAt = DateTime.UtcNow;
            subscription.UpdatedAt = DateTime.UtcNow;

            // Top up the client credits
            client.AvailableCredits += plan.IncludedCredits;

            // Billing record
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

            return AssignSubscriptionCommandHandler.MapToDto(subscription, client.Name, plan);
        }
    }
}
