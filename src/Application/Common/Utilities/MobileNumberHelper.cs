using System.Text.RegularExpressions;

namespace Application.Common.Utilities
{
    public static partial class MobileNumberHelper
    {
public const string MobileNumberPattern = @"^\d{10}$";

    // Kept for backward compatibility
    public const string IndianMobileNumberPattern = MobileNumberPattern;

    [GeneratedRegex(MobileNumberPattern, RegexOptions.Compiled)]
    private static partial Regex MobileNumberRegex();

    public static bool IsValid(string? number)
    {
        if (string.IsNullOrWhiteSpace(number)) return false;
        var normalized = Normalize(number.Trim());
        return MobileNumberRegex().IsMatch(normalized);
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