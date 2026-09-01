using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admins.Queries
{
    public class GetAdminDashboardStatsQueryHandler : IRequestHandler<GetAdminDashboardStatsQuery, AdminDashboardStatsDto>
    {
        private readonly IApplicationDbContext _context;

        public GetAdminDashboardStatsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardStatsDto> Handle(GetAdminDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var today = DateTime.UtcNow.Date;
            var sevenDaysAgo = today.AddDays(-6);

            var totalPartners = await _context.Partners.CountAsync(cancellationToken);
            var totalClients = await _context.Clients.CountAsync(cancellationToken);

            var todaysMessages = await _context.Messages
                .AsNoTracking()
                .Where(m => m.CreatedAt >= today && m.CreatedAt < today.AddDays(1))
                .Select(m => m.Status)
                .ToListAsync(cancellationToken);

            var messagesSentToday = todaysMessages.Count;
            var deliveredToday = todaysMessages.Count(s => s == "Delivered");
            var failedToday = todaysMessages.Count(s => s == "Failed");
            var deliveryRate = messagesSentToday == 0
                ? 0
                : Math.Round((deliveredToday * 100m) / messagesSentToday, 2);

            var openTickets = await _context.Tickets
                .AsNoTracking()
                .CountAsync(t => t.Status == TicketStatus.Open, cancellationToken);

            var creditsRemaining = await _context.Clients
                .AsNoTracking()
                .SumAsync(c => (int?)c.AvailableCredits, cancellationToken) ?? 0;

            var campaignsRunning = await _context.ScheduledMessages
                .AsNoTracking()
                .CountAsync(
                    s => s.Status == ScheduledMessageStatus.Scheduled || s.Status == ScheduledMessageStatus.Processing,
                    cancellationToken);

            var trendRaw = await _context.Messages
                .AsNoTracking()
                .Where(m => m.CreatedAt >= sevenDaysAgo && m.CreatedAt < today.AddDays(1))
                .GroupBy(m => m.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Sent = g.Count(),
                    Delivered = g.Count(m => m.Status == "Delivered"),
                })
                .ToListAsync(cancellationToken);

            var messageTrend = Enumerable.Range(0, 7)
                .Select(offset => sevenDaysAgo.AddDays(offset))
                .Select(date =>
                {
                    var match = trendRaw.FirstOrDefault(t => t.Date == date);
                    return new DailyMessageTrendDto
                    {
                        Date = date,
                        Sent = match?.Sent ?? 0,
                        Delivered = match?.Delivered ?? 0,
                    };
                })
                .ToList();

            var topClientsByVolume = await _context.Messages
                .AsNoTracking()
                .GroupBy(m => m.ClientId)
                .Select(g => new { ClientId = g.Key, MessageCount = g.Count() })
                .OrderByDescending(g => g.MessageCount)
                .Take(5)
                .Join(
                    _context.Clients.AsNoTracking(),
                    g => g.ClientId,
                    c => c.Id,
                    (g, c) => new TopClientVolumeDto
                    {
                        ClientId = c.Id,
                        ClientName = c.Name,
                        MessageCount = g.MessageCount,
                    })
                .ToListAsync(cancellationToken);

            var creditUsed = await _context.CreditTransactions
                .AsNoTracking()
                .Where(t => t.Type == CreditTransactionType.Debit)
                .SumAsync(t => (int?)t.Amount, cancellationToken) ?? 0;

            var creditUsage = new CreditUsageSummaryDto
            {
                Used = creditUsed,
                Remaining = creditsRemaining,
            };

            var ticketStatusCounts = await _context.Tickets
                .AsNoTracking()
                .GroupBy(t => t.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var ticketStatusSummary = new TicketStatusSummaryDto
            {
                Open = ticketStatusCounts.FirstOrDefault(g => g.Status == TicketStatus.Open)?.Count ?? 0,
                Pending = ticketStatusCounts.FirstOrDefault(g => g.Status == TicketStatus.InProgress)?.Count ?? 0,
                Resolved = ticketStatusCounts
                    .Where(g => g.Status == TicketStatus.Resolved || g.Status == TicketStatus.Closed)
                    .Sum(g => g.Count),
            };

            var recentCampaignGroups = await _context.Messages
                .AsNoTracking()
                .GroupBy(m => new { m.TemplateId, Date = m.CreatedAt.Date })
                .Select(g => new
                {
                    g.Key.TemplateId,
                    g.Key.Date,
                    Recipients = g.Count(),
                    Failed = g.Count(m => m.Status == "Failed"),
                    Pending = g.Count(m => m.Status == "Pending"),
                    LastActivity = g.Max(m => m.CreatedAt),
                })
                .OrderByDescending(g => g.LastActivity)
                .Take(5)
                .ToListAsync(cancellationToken);

            var templateIds = recentCampaignGroups.Select(g => g.TemplateId).Distinct().ToList();
            var templateNames = await _context.Templates
                .AsNoTracking()
                .Where(t => templateIds.Contains(t.TemplateId))
                .ToDictionaryAsync(t => t.TemplateId, t => t.TemplateName, cancellationToken);

            var recentCampaigns = recentCampaignGroups
                .Select(g => new RecentCampaignDto
                {
                    Title = templateNames.GetValueOrDefault(g.TemplateId, "Campaign"),
                    Summary = $"{g.Recipients} recipients",
                    CreatedAt = g.LastActivity,
                    Status = g.Pending > 0 ? "In Progress" : g.Failed > 0 ? "Partially Failed" : "Sent",
                })
                .ToList();

            var recentTickets = await _context.Tickets
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new RecentTicketDto
                {
                    TicketNumber = t.TicketNumber,
                    ClientName = t.ClientName,
                    IssueDate = t.IssueDate,
                    Status = t.Status.ToString(),
                })
                .ToListAsync(cancellationToken);

            return new AdminDashboardStatsDto
            {
                TotalPartners = totalPartners,
                TotalClients = totalClients,
                MessagesSentToday = messagesSentToday,
                DeliveryRate = deliveryRate,
                FailedMessagesToday = failedToday,
                OpenTickets = openTickets,
                CreditsRemaining = creditsRemaining,
                CampaignsRunning = campaignsRunning,
                MessageTrend = messageTrend,
                TopClientsByVolume = topClientsByVolume,
                CreditUsage = creditUsage,
                TicketStatusSummary = ticketStatusSummary,
                RecentCampaigns = recentCampaigns,
                RecentTickets = recentTickets,
            };
        }
    }
}
