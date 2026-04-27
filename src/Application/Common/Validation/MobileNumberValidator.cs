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
                .WithMessage("Invalid Indian mobile number");
        }
    }
}