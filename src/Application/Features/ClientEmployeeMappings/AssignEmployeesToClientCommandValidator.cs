using FluentValidation;

namespace Application.Features.ClientEmployeeMappings
{
    public class AssignEmployeesToClientCommandValidator : AbstractValidator<AssignEmployeesToClientCommand>
    {
        public AssignEmployeesToClientCommandValidator()
        {
            RuleFor(command => command.ClientId)
                .NotEmpty().WithMessage("Client id is required.");

            RuleFor(command => command.UserIds)
                .NotEmpty().WithMessage("At least one employee user id is required.");

            RuleForEach(command => command.UserIds)
                .NotEmpty().WithMessage("Employee user id cannot be empty.");
        }
    }
}