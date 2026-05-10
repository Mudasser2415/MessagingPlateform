using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Processes subscriptions flagged for auto-renewal 3 days before expiry.
    /// Scheduled as a recurring Hangfire job every 6 hours.
    /// </summary>
    public class AutoRenewJob
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AutoRenewJob> _logger;

        public AutoRenewJob(
            IServiceScopeFactory scopeFactory,
            ILogger<AutoRenewJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        [AutomaticRetry(Attempts = 3)]
        public async Task RunAsync()
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var now = DateTime.UtcNow;
            var renewWindow = now.AddDays(3); // renew 3 days before expiry

            var dueForRenewal = await db.ClientSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Include(s => s.Client)
                .Where(s =>
                    s.AutoRenew &&
                    s.Status == SubscriptionStatus.Active &&
                    s.EndDate <= renewWindow &&
                    s.EndDate > now)
                .ToListAsync();

            if (dueForRenewal.Count == 0)
            {
                _logger.LogDebug("AutoRenewJob: no subscriptions due for renewal at {Now}", now);
                return;
            }

            foreach (var sub in dueForRenewal)
            {
                try
                {
                    var plan = sub.SubscriptionPlan!;
                    var client = sub.Client!;

                    sub.EndDate = sub.EndDate.AddDays(plan.DurationInDays);
                    sub.TotalCreditsAllocated += plan.IncludedCredits;
                    sub.RemainingCredits += plan.IncludedCredits;
                    sub.LastRenewedAt = now;
                    sub.UpdatedAt = now;

                    client.AvailableCredits += plan.IncludedCredits;

                    var transaction = new SubscriptionTransaction
                    {
                        Id = Guid.NewGuid(),
                        ClientSubscriptionId = sub.Id,
                        Amount = plan.Price,
                        PaymentStatus = PaymentStatus.Paid,
                        PaymentMethod = PaymentMethod.Cash,
                        TransactionReference = $"AUTO-RENEW-{now:yyyyMMddHHmmss}",
                        PaidAt = now,
                        CreatedAt = now
                    };

                    db.SubscriptionTransactions.Add(transaction);

                    _logger.LogInformation(
                        "AutoRenewJob: auto-renewed subscription {Id} for client {ClientId} until {EndDate}",
                        sub.Id, sub.ClientId, sub.EndDate);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "AutoRenewJob: failed to auto-renew subscription {Id}", sub.Id);
                }
            }

            await db.SaveChangesAsync(CancellationToken.None);
            _logger.LogInformation("AutoRenewJob: processed {Count} auto-renewals", dueForRenewal.Count);
        }
    }
}
