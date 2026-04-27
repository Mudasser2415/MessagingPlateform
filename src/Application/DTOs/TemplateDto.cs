using System;

namespace Application.DTOs
{
    public class TemplateDto
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string TemplateContent { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string TemplateType { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
