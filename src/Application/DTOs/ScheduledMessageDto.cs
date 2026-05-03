using System;

namespace Application.DTOs
{
    public class ScheduledMessageDto
    {
        public Guid Id { get; init; }
        public Guid ClientId { get; init; }
        public Guid TemplateId { get; init; }
        public string TemplateName { get; init; } = string.Empty;
        public Guid? GroupId { get; init; }
        public string? GroupName { get; init; }
        public string? PhoneNumber { get; init; }
        public DateTime ScheduledAt { get; init; }
        public string Status { get; init; } = string.Empty;
        public string? ErrorMessage { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? ProcessedAt { get; init; }
    }
}
