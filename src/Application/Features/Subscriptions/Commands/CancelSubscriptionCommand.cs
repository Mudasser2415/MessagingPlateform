using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Commands
{
    public class CancelSubscriptionCommand : IRequest<ClientSubscriptionDto>
    {
        public Guid SubscriptionId { get; set; }
        public string? CancelledBy { get; set; }
    }

    public class CancelSubscriptionCommandHandler
        : IRequestHandler<CancelSubscriptionCommand, ClientSubscriptionDto>
    {
        private readonly IApplicationDbContext _db;

        public CancelSubscriptionCommandHandler(IApplicationDbContext db) => _db = db;

        public async Task<ClientSubscriptionDto> Handle(
            CancelSubscriptionCommand request,
            CancellationToken cancellationToken)
        {
            var subscription = await _db.ClientSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Include(s => s.Client)
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken)
                ?? throw new KeyNotFoundException($"Subscription {request.SubscriptionId} not found.");

            if (subscription.Status == SubscriptionStatus.Cancelled)
                throw new InvalidOperationException("Subscription is already cancelled.");

            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.AutoRenew = false;
            subscription.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            return AssignSubscriptionCommandHandler.MapToDto(
                subscription,
                subscription.Client!.Name,
                subscription.SubscriptionPlan!);
        }
    }
}
