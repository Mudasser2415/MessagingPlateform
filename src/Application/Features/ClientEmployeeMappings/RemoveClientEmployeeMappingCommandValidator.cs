using FluentValidation;

namespace Application.Features.ClientEmployeeMappings
{
    public class RemoveClientEmployeeMappingCommandValidator : AbstractValidator<RemoveClientEmployeeMappingCommand>
    {
        public RemoveClientEmployeeMappingCommandValidator()
        {
            RuleFor(command => command.ClientId)
                .NotEmpty().WithMessage("Client id is required.");

            RuleFor(command => command.UserId)
                .NotEmpty().WithMessage("User id is required.");
        }
    }
}