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
    /// Scans all active subscriptions and marks them Expired once EndDate + GracePeriod has passed.
    /// Scheduled as a recurring Hangfire job every hour.
    /// </summary>
    public class SubscriptionExpiryJob
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SubscriptionExpiryJob> _logger;

        public SubscriptionExpiryJob(
            IServiceScopeFactory scopeFactory,
            ILogger<SubscriptionExpiryJob> logger)
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

            // Load active subscriptions whose end-date + grace period has passed
            var expired = await db.ClientSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.Status == SubscriptionStatus.Active)
                .ToListAsync();

            var toExpire = expired.Where(s =>
            {
                var graceDays = s.SubscriptionPlan?.GracePeriodDays ?? 0;
                return s.EndDate.AddDays(graceDays) < now;
            }).ToList();

            if (toExpire.Count == 0)
            {
                _logger.LogDebug("SubscriptionExpiryJob: no subscriptions to expire at {Now}", now);
                return;
            }

            foreach (var sub in toExpire)
            {
                sub.Status = SubscriptionStatus.Expired;
                sub.UpdatedAt = now;
                _logger.LogInformation(
                    "SubscriptionExpiryJob: marked subscription {Id} (client {ClientId}) as Expired",
                    sub.Id, sub.ClientId);
            }

            await db.SaveChangesAsync(CancellationToken.None);
            _logger.LogInformation("SubscriptionExpiryJob: expired {Count} subscriptions", toExpire.Count);
        }
    }
}
