using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.Clients.Queries
{
    public class LoginClientQueryValidator : AbstractValidator<LoginClientQuery>
    {
        public LoginClientQueryValidator()
        {
            RuleFor(x => x.MobileNumber)
                .NotEmpty().WithMessage("MobileNumber is required.")
                .MustBeValidIndianMobileNumber();

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.");
        }
    }
}