using Application.Common.Interfaces;
using Domain.Enums;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Checks all open/in-progress tickets and marks SlaStatus = Breached
    /// when the elapsed time exceeds the SLA threshold for the priority.
    /// Runs every 15 minutes via Hangfire.
    /// </summary>
    public class SlaBreachJob
    {
        // SLA thresholds per priority (hours)
        private static readonly Dictionary<TicketPriority, double> SlaHours = new()
        {
            { TicketPriority.Critical, 4 },
            { TicketPriority.High,     8 },
            { TicketPriority.Medium,  24 },
            { TicketPriority.Low,     48 },
        };

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SlaBreachJob> _logger;

        public SlaBreachJob(IServiceScopeFactory scopeFactory, ILogger<SlaBreachJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        [AutomaticRetry(Attempts = 2)]
        public async Task RunAsync()
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var now = DateTime.UtcNow;

            // Only check active (unresolved) tickets not already marked Breached
            var activeTickets = await db.Tickets
                .Where(t =>
                    t.Status != TicketStatus.Resolved &&
                    t.Status != TicketStatus.Closed &&
                    t.Status != TicketStatus.Rejected &&
                    t.SlaStatus != SlaStatus.Breached)
                .ToListAsync();

            int breachedCount = 0;

            foreach (var ticket in activeTickets)
            {
                var threshold = SlaHours[ticket.Priority];
                var elapsed = (now - ticket.IssueDate).TotalHours;

                if (elapsed > threshold)
                {
                    ticket.SlaStatus = SlaStatus.Breached;
                    ticket.UpdatedAt = now;
                    breachedCount++;
                }
            }

            if (breachedCount > 0)
            {
                await db.SaveChangesAsync(CancellationToken.None);
                _logger.LogInformation("SlaBreachJob: marked {Count} ticket(s) as SLA Breached at {Now}", breachedCount, now);
            }
            else
            {
                _logger.LogDebug("SlaBreachJob: no new SLA breaches at {Now}", now);
            }
        }
    }
}
