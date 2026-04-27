using System.Text.RegularExpressions;

namespace Application.Common.Utilities
{
    public static partial class MobileNumberHelper
    {
        public const string IndianMobileNumberPattern = @"^(?:\+91|91)?[6-9]\d{9}$";

        [GeneratedRegex(IndianMobileNumberPattern, RegexOptions.Compiled)]
        private static partial Regex IndianMobileNumberRegex();

        public static bool IsValid(string? number)
        {
            return !string.IsNullOrWhiteSpace(number) && IndianMobileNumberRegex().IsMatch(number.Trim());
        }

        public static string Normalize(string? number)
        {
            if (string.IsNullOrWhiteSpace(number))
            {
                return string.Empty;
            }

            var trimmed = number.Trim();
            var digits = trimmed.StartsWith('+') ? trimmed[1..] : trimmed;

            if (digits.StartsWith("91", StringComparison.Ordinal) && digits.Length == 12)
            {
                return digits[2..];
            }

            return digits;
        }
    }
}