using FluentValidation;
using System.Linq;

namespace Application.Features.Templates.Commands
{
    public class UpdateTemplateCommandValidator : AbstractValidator<UpdateTemplateCommand>
    {
        public UpdateTemplateCommandValidator()
        {
            RuleFor(v => v.TemplateId)
                .NotEmpty().WithMessage("TemplateId is required.");

            RuleFor(v => v.TemplateName)
                .NotEmpty().WithMessage("TemplateName is required.")
                .MaximumLength(200).WithMessage("TemplateName must not exceed 200 characters.");

            RuleFor(v => v.TemplateContent)
                .NotEmpty().WithMessage("TemplateContent is required.");

            RuleFor(v => v.Category)
                .NotEmpty().WithMessage("Category is required.")
                .Must(x => new[] { "Utility", "Marketing", "Authentication" }.Contains(x))
                .WithMessage("Category must be either Utility, Marketing, or Authentication.");

            RuleFor(v => v.TemplateType)
                .NotEmpty().WithMessage("TemplateType is required.")
                .Must(x => new[] { "Text", "Text+Image", "Text+Link" }.Contains(x))
                .WithMessage("TemplateType must be either Text, Text+Image, or Text+Link.");
        }
    }
}
