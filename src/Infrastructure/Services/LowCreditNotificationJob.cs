using Application.Common.Interfaces;
using Domain.Enums;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Logs (and optionally sends alerts) when a client's remaining subscription credits
    /// fall below 20 % of their total allocation.
    /// Scheduled as a recurring Hangfire job once a day.
    /// </summary>
    public class LowCreditNotificationJob
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<LowCreditNotificationJob> _logger;
        private const double LowCreditThreshold = 0.20; // 20 %

        public LowCreditNotificationJob(
            IServiceScopeFactory scopeFactory,
            ILogger<LowCreditNotificationJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        [AutomaticRetry(Attempts = 2)]
        public async Task RunAsync()
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var lowCreditSubs = await db.ClientSubscriptions
                .AsNoTracking()
                .Include(s => s.Client)
                .Include(s => s.SubscriptionPlan)
                .Where(s =>
                    s.Status == SubscriptionStatus.Active &&
                    s.TotalCreditsAllocated > 0 &&
                    (double)s.RemainingCredits / s.TotalCreditsAllocated <= LowCreditThreshold)
                .ToListAsync();

            foreach (var sub in lowCreditSubs)
            {
                var usagePct = sub.TotalCreditsAllocated == 0
                    ? 0
                    : (int)((1 - (double)sub.RemainingCredits / sub.TotalCreditsAllocated) * 100);

                _logger.LogWarning(
                    "LowCreditAlert: Client {ClientName} ({ClientId}) has used {Pct}% of credits " +
                    "({Remaining}/{Total} remaining). Subscription expires {EndDate}.",
                    sub.Client?.Name, sub.ClientId, usagePct,
                    sub.RemainingCredits, sub.TotalCreditsAllocated, sub.EndDate);

                // Extend here: send email/SMS/push notification via INotificationService
            }

            _logger.LogInformation(
                "LowCreditNotificationJob: {Count} low-credit alerts processed", lowCreditSubs.Count);
        }
    }
}
