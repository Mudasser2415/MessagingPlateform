using FluentValidation;

namespace Application.Features.Credits.Commands
{
    public class AddCreditsCommandValidator : AbstractValidator<AddCreditsCommand>
    {
        public AddCreditsCommandValidator()
        {
            RuleFor(command => command.ClientId)
                .NotEmpty().WithMessage("ClientId is required.");

            RuleFor(command => command.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than zero.");
        }
    }
}