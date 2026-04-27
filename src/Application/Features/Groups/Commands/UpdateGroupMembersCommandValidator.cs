using Application.Common.Validation;
using FluentValidation;
using System.Linq;

namespace Application.Features.Groups.Commands
{
    public class UpdateGroupMembersCommandValidator : AbstractValidator<UpdateGroupMembersCommand>
    {
        public UpdateGroupMembersCommandValidator()
        {
            RuleFor(v => v.GroupId)
                .NotEmpty().WithMessage("GroupId is required.");

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
