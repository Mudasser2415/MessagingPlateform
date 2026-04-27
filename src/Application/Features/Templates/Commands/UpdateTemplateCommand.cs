using MediatR;
using System;

namespace Application.Features.Templates.Commands
{
    public class UpdateTemplateCommand : IRequest<bool>
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string TemplateContent { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string TemplateType { get; set; } = string.Empty;
    }
}
