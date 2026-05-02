using Application.Common.Utilities;
using FluentValidation;

namespace Application.Common.Validation
{
    public static class MobileNumberValidator
    {
        public static IRuleBuilderOptions<T, string> MustBeValidIndianMobileNumber<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder
                .Must(MobileNumberHelper.IsValid)
                .WithMessage("Invalid mobile number. Must be exactly 10 digits.");
        }
    }
}