using FluentValidation;

namespace Application.Features.Partners.Commands
{
    public class PartnerLoginCommandValidator : AbstractValidator<PartnerLoginCommand>
    {
        public PartnerLoginCommandValidator()
        {
            RuleFor(x => x.EmailOrMobileNumber).NotEmpty().MaximumLength(256);
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        }
    }
}