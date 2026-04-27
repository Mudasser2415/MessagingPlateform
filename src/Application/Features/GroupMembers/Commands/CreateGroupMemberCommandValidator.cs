using Application.Common.Validation;
using FluentValidation;

namespace Application.Features.GroupMembers.Commands
{
    public class CreateGroupMemberCommandValidator : AbstractValidator<CreateGroupMemberCommand>
    {
        public CreateGroupMemberCommandValidator()
        {
            RuleFor(v => v.GroupId)
                .NotEmpty().WithMessage("GroupId is required.");

            RuleFor(v => v.PhoneNumber)
                .NotEmpty().WithMessage("PhoneNumber is required.")
                .MustBeValidIndianMobileNumber();
        }
    }
}
