using Application.Common.Utilities;

namespace Application.Common.Services
{
    /// <summary>
    /// Service for validating and normalizing phone numbers
    /// </summary>
    public interface IPhoneValidationService
    {
        /// <summary>
        /// Validates if a phone number is a valid Indian mobile number.
        /// </summary>
        bool IsValidPhoneNumber(string phoneNumber);

        /// <summary>
        /// Normalizes to the 10-digit Indian mobile format.
        /// </summary>
        string NormalizePhoneNumber(string phoneNumber);

        /// <summary>
        /// Removes duplicate phone numbers, returns unique list
        /// </summary>
        List<string> RemoveDuplicates(List<string> phoneNumbers);

        /// <summary>
        /// Validates and normalizes a list of phone numbers, removing duplicates
        /// Returns a tuple with (validPhoneNumbers, invalidPhoneNumbers)
        /// </summary>
        (List<string> ValidPhones, List<string> InvalidPhones) ValidateAndNormalizeBatch(List<string> phoneNumbers);
    }

    public class PhoneValidationService : IPhoneValidationService
    {
        /// <summary>
        /// Validates if a phone number is in a valid Indian mobile number format.
        /// </summary>
        public bool IsValidPhoneNumber(string phoneNumber)
        {
            return MobileNumberHelper.IsValid(phoneNumber);
        }

        /// <summary>
        /// Normalizes to the 10-digit Indian mobile format.
        /// </summary>
        public string NormalizePhoneNumber(string phoneNumber)
        {
            return MobileNumberHelper.Normalize(phoneNumber);
        }

        /// <summary>
        /// Removes duplicate phone numbers, returns unique list
        /// Uses normalized form for comparison
        /// </summary>
        public List<string> RemoveDuplicates(List<string> phoneNumbers)
        {
            if (phoneNumbers == null || phoneNumbers.Count == 0)
                return new List<string>();

            var seen = new HashSet<string>();
            var result = new List<string>();

            foreach (var phone in phoneNumbers)
            {
                if (!IsValidPhoneNumber(phone))
                {
                    continue;
                }

                var normalized = NormalizePhoneNumber(phone);
                if (seen.Add(normalized))
                {
                    result.Add(normalized);
                }
            }

            return result;
        }

        /// <summary>
        /// Validates and normalizes a list of phone numbers, removing duplicates
        /// Returns a tuple with (validPhoneNumbers, invalidPhoneNumbers)
        /// </summary>
        public (List<string> ValidPhones, List<string> InvalidPhones) ValidateAndNormalizeBatch(List<string> phoneNumbers)
        {
            var validPhones = new List<string>();
            var invalidPhones = new List<string>();

            foreach (var phone in phoneNumbers)
            {
                if (IsValidPhoneNumber(phone))
                {
                    validPhones.Add(NormalizePhoneNumber(phone));
                }
                else
                {
                    invalidPhones.Add(phone);
                }
            }

            // Remove duplicates from valid phones
            validPhones = RemoveDuplicates(validPhones);

            return (validPhones, invalidPhones);
        }
    }
}
