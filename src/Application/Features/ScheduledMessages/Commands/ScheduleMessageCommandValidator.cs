using Application.Common.Validation;
using FluentValidation;
using System;

namespace Application.Features.ScheduledMessages.Commands
{
    public class ScheduleMessageCommandValidator : AbstractValidator<ScheduleMessageCommand>
    {
        public ScheduleMessageCommandValidator()
        {
            RuleFor(x => x.ClientId).NotEmpty();
            RuleFor(x => x.TemplateId).NotEmpty();

            RuleFor(x => x)
                .Must(x => x.GroupId.HasValue || !string.IsNullOrWhiteSpace(x.PhoneNumber))
                .WithName("Target")
                .WithMessage("Either GroupId or PhoneNumber must be provided.");

            RuleFor(x => x)
                .Must(x => !(x.GroupId.HasValue && !string.IsNullOrWhiteSpace(x.PhoneNumber)))
                .WithName("Target")
                .WithMessage("Provide either GroupId or PhoneNumber, not both.");

            RuleFor(x => x.PhoneNumber)
                .MustBeValidIndianMobileNumber()
                .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));

            RuleFor(x => x.ScheduledAt)
                .NotEmpty()
                .Must(d => d.ToUniversalTime() > DateTime.UtcNow.AddMinutes(1))
                .WithMessage("Scheduled time must be at least 1 minute in the future.");
        }
    }
}
