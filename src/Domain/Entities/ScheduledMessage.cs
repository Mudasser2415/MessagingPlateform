using Domain.Enums;
using System;

namespace Domain.Entities
{
    public class ScheduledMessage
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime ScheduledAt { get; set; }
        public ScheduledMessageStatus Status { get; set; } = ScheduledMessageStatus.Scheduled;
        public int RetryCount { get; set; }
        public string? HangfireJobId { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string? CreatedByUserId { get; set; }

        // Navigation properties
        public Client? Client { get; set; }
        public Template? Template { get; set; }
        public Group? Group { get; set; }
    }
}
