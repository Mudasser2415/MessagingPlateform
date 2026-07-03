using System;

namespace Application.DTOs
{
    public class SavedMessageTemplateDto
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
    }
}