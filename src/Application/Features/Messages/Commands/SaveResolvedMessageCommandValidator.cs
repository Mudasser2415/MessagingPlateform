using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.Messages.Commands
{
    public class SaveResolvedMessageCommandValidator : AbstractValidator<SaveResolvedMessageCommand>
    {
        public SaveResolvedMessageCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEqual(Guid.Empty).WithMessage("Id cannot be empty when provided.")
                .When(v => v.Id.HasValue);

            RuleFor(v => v.ClientId)
                .NotEmpty().WithMessage("ClientId is required.");

            RuleFor(v => v.TemplateId)
                .NotEmpty().WithMessage("TemplateId is required.");

            RuleFor(v => v.PhoneNumber)
                .MustBeValidIndianMobileNumber()
                .When(v => !string.IsNullOrWhiteSpace(v.PhoneNumber));

            RuleFor(v => v)
                .Must(v => v.GroupId.HasValue || !string.IsNullOrWhiteSpace(v.PhoneNumber))
                .WithMessage("Either GroupId or PhoneNumber is required.");

            RuleFor(v => v.MessageContent)
                .NotEmpty().WithMessage("MessageContent is required.");
        }
    }
}
