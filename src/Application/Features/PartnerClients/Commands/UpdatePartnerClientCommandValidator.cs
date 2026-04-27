using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.PartnerClients.Commands
{
    public class UpdatePartnerClientCommandValidator : AbstractValidator<UpdatePartnerClientCommand>
    {
        public UpdatePartnerClientCommandValidator()
        {
            RuleFor(x => x.PartnerId).NotEmpty();
            RuleFor(x => x.ClientId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.MobileNumber).NotEmpty().MustBeValidIndianMobileNumber();
            RuleFor(x => x.Address).MaximumLength(250);
            RuleFor(x => x.Location).MaximumLength(100);
            RuleFor(x => x.BusinessType).MaximumLength(50);
            RuleFor(x => x.EmailId).MaximumLength(256);
        }
    }
}