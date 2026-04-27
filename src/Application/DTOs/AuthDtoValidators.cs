using Application.Common.Validation;
using FluentValidation;

namespace Application.DTOs
{
    public class RegisterUserDtoValidator : AbstractValidator<RegisterUserDto>
    {
        public RegisterUserDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(256);

            RuleFor(x => x.MobileNumber)
                .NotEmpty().WithMessage("Mobile number is required")
                .MustBeValidIndianMobileNumber();

            RuleFor(x => x.Email)
                .EmailAddress()
                .MaximumLength(256)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters");

            RuleFor(x => x.Role)
                .Must(role => role == "Admin" || role == "Employee")
                .WithMessage("Role must be 'Admin' or 'Employee'");
        }
    }

    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.MobileNumber)
                .NotEmpty().WithMessage("Mobile number is required")
                .MustBeValidIndianMobileNumber();

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        }
    }

    public class LoginByEmailDtoValidator : AbstractValidator<LoginByEmailDto>
    {
        public LoginByEmailDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress();

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        }
    }
}