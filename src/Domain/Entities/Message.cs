using System;

namespace Domain.Entities
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Sent, Failed, Delivered
        public int RetryCount { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }

        public Client? Client { get; set; }
        public Template? Template { get; set; }
        public Group? Group { get; set; }
    }
}
