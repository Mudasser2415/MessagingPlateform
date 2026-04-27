using System;

namespace Application.DTOs
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
    }
}
