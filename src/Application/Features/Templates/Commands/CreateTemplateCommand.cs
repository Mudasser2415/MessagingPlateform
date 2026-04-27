using MediatR;
using System;

namespace Application.Features.Templates.Commands
{
    public class CreateTemplateCommand : IRequest<Guid>
    {
        public string TemplateName { get; set; } = string.Empty;
        public string TemplateContent { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string TemplateType { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
    }
}
