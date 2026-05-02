using FluentValidation;

namespace Application.Features.Messages.Commands
{
    public class SendGroupMessageCommandValidator : AbstractValidator<SendGroupMessageCommand>
    {
        public SendGroupMessageCommandValidator()
        {
            RuleFor(v => v.ClientId)
                .NotEmpty().WithMessage("ClientId is required.");

            RuleFor(v => v.TemplateId)
                .NotEmpty().WithMessage("TemplateId is required.");

            RuleFor(v => v.GroupId)
                .NotEmpty().WithMessage("GroupId is required.");
        }
    }
}
