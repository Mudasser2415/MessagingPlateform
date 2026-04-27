using Application.Common.Validation;
using FluentValidation;
using System.Linq;

namespace Application.Features.Groups.Commands
{
    public class CreateGroupCommandValidator : AbstractValidator<CreateGroupCommand>
    {
        public CreateGroupCommandValidator()
        {
            RuleFor(v => v.GroupName)
                .NotEmpty().WithMessage("GroupName is required.")
                .MaximumLength(100).WithMessage("GroupName must not exceed 100 characters.");

            RuleFor(v => v.ClientId)
                .NotEmpty().WithMessage("ClientId is required.");

            RuleFor(v => v.PhoneNumbers)
                .NotNull().WithMessage("PhoneNumbers list is required.")
                .Must(phones => phones != null && phones.Any())
                .WithMessage("At least one phone number is required.");

            RuleForEach(v => v.PhoneNumbers)
                .NotEmpty().WithMessage("Phone number cannot be empty.")
                .MustBeValidIndianMobileNumber();
        }
    }
}
