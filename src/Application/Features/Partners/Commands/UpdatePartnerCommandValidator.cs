using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.Partners.Commands
{
    public class UpdatePartnerCommandValidator : AbstractValidator<UpdatePartnerCommand>
    {
        public UpdatePartnerCommandValidator()
        {
            RuleFor(x => x.PartnerId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
            RuleFor(x => x.Email)
                .EmailAddress().MaximumLength(256)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.MobileNumber).NotEmpty().MustBeValidIndianMobileNumber();
            RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(200);
            RuleFor(x => x.CompanyAddress).MaximumLength(500);
        }
    }
}