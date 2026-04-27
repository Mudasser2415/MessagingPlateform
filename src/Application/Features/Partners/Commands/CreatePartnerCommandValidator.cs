using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.Partners.Commands
{
    public class CreatePartnerCommandValidator : AbstractValidator<CreatePartnerCommand>
    {
        public CreatePartnerCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().MaximumLength(256);

            RuleFor(x => x.Email)
                .EmailAddress().MaximumLength(256)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.MobileNumber)
                .NotEmpty().MustBeValidIndianMobileNumber();

            RuleFor(x => x.Password)
                .NotEmpty().MinimumLength(8);

            RuleFor(x => x.CompanyName)
                .NotEmpty().MaximumLength(200);

            RuleFor(x => x.CompanyAddress)
                .MaximumLength(500);

            RuleFor(x => x.Location)
                .MaximumLength(500);
        }
    }
}