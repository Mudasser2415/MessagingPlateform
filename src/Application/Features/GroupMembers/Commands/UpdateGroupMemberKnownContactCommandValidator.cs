using FluentValidation;

namespace Application.Features.GroupMembers.Commands
{
    public class UpdateGroupMemberKnownContactCommandValidator : AbstractValidator<UpdateGroupMemberKnownContactCommand>
    {
        public UpdateGroupMemberKnownContactCommandValidator()
        {
            RuleFor(command => command.Id)
                .NotEmpty();
        }
    }
}