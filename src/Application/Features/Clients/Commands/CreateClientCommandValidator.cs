using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.Clients.Commands
{
    public class CreateClientCommandValidator : AbstractValidator<CreateClientCommand>
    {
        public CreateClientCommandValidator()
        {
            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

            RuleFor(v => v.MobileNumber)
                .NotEmpty().WithMessage("MobileNumber is required.")
                .MustBeValidIndianMobileNumber();

            RuleFor(v => v.Address)
                .MaximumLength(250).WithMessage("Address must not exceed 250 characters.");

            RuleFor(v => v.Location)
                .MaximumLength(100).WithMessage("Location must not exceed 100 characters.");

            RuleFor(v => v.BusinessType)
                .MaximumLength(50).WithMessage("BusinessType must not exceed 50 characters.");
        }
    }
}
