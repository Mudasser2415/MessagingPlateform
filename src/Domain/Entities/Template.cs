using System;

namespace Domain.Entities
{
    public class Template
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string TemplateContent { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Utility, Marketing, Authentication
        public string TemplateType { get; set; } = string.Empty; // Text, Text+Image, Text+Link
        public Guid ClientId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public Client? Client { get; set; }
    }
}
