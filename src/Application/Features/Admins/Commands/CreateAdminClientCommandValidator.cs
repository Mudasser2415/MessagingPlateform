using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.Admins.Commands
{
    public class CreateAdminClientCommandValidator : AbstractValidator<CreateAdminClientCommand>
    {
        public CreateAdminClientCommandValidator()
        {
            RuleFor(command => command.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

            RuleFor(command => command.MobileNumber)
                .NotEmpty().WithMessage("Mobile number is required.")
                .MustBeValidIndianMobileNumber();

            RuleFor(command => command.Address)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(250).WithMessage("Address must not exceed 250 characters.");

            RuleFor(command => command.Location)
                .NotEmpty().WithMessage("Location is required.")
                .MaximumLength(100).WithMessage("Location must not exceed 100 characters.");

            RuleFor(command => command.BusinessType)
                .NotEmpty().WithMessage("Business type is required.")
                .MaximumLength(50).WithMessage("Business type must not exceed 50 characters.");

            RuleFor(command => command.EmailId)
                .MaximumLength(256).WithMessage("Email must not exceed 256 characters.")
                .When(command => !string.IsNullOrWhiteSpace(command.EmailId));
        }
    }
}