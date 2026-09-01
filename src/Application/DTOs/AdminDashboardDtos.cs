using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class AdminDashboardStatsDto
    {
        public int TotalPartners { get; set; }
        public int TotalClients { get; set; }
        public int MessagesSentToday { get; set; }
        public decimal DeliveryRate { get; set; }
        public int FailedMessagesToday { get; set; }
        public int OpenTickets { get; set; }
        public int CreditsRemaining { get; set; }
        public int CampaignsRunning { get; set; }

        public List<DailyMessageTrendDto> MessageTrend { get; set; } = new();
        public List<TopClientVolumeDto> TopClientsByVolume { get; set; } = new();
        public CreditUsageSummaryDto CreditUsage { get; set; } = new();
        public TicketStatusSummaryDto TicketStatusSummary { get; set; } = new();
        public List<RecentCampaignDto> RecentCampaigns { get; set; } = new();
        public List<RecentTicketDto> RecentTickets { get; set; } = new();
    }

    public class DailyMessageTrendDto
    {
        public DateTime Date { get; set; }
        public int Sent { get; set; }
        public int Delivered { get; set; }
    }

    public class TopClientVolumeDto
    {
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int MessageCount { get; set; }
    }

    public class CreditUsageSummaryDto
    {
        public int Used { get; set; }
        public int Remaining { get; set; }
    }

    public class TicketStatusSummaryDto
    {
        public int Open { get; set; }
        public int Pending { get; set; }
        public int Resolved { get; set; }
    }

    public class RecentCampaignDto
    {
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class RecentTicketDto
    {
        public string TicketNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
