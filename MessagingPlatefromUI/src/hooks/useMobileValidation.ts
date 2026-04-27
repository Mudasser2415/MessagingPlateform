import { useState } from "react";
import {
  getMobileValidationError,
  normalizeIndianMobileNumber,
  sanitizeMobileNumberInput,
} from "../utils/mobileValidation";

type UseMobileValidationOptions = {
  required?: boolean;
  normalizeOnBlur?: boolean;
  emptyMessage?: string;
  invalidMessage?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

export function useMobileValidation(
  value: string,
  options: UseMobileValidationOptions = {},
) {
  const [touched, setTouched] = useState(false);

  const rawError = getMobileValidationError(value, {
    required: options.required,
    emptyMessage: options.emptyMessage,
    invalidMessage: options.invalidMessage,
  });

  const handleChange = (nextValue: string) => {
    options.onChange?.(sanitizeMobileNumberInput(nextValue));
  };

  const handleBlur = () => {
    setTouched(true);

    if (options.normalizeOnBlur !== false) {
      const normalizedValue = normalizeIndianMobileNumber(value);
      if (normalizedValue !== value) {
        options.onChange?.(normalizedValue);
      }
    }

    options.onBlur?.();
  };

  const validateNow = () => {
    setTouched(true);
    return !rawError;
  };

  return {
    error: touched ? rawError : undefined,
    rawError,
    isTouched: touched,
    isValid: !rawError,
    normalizedValue: normalizeIndianMobileNumber(value),
    validateNow,
    handleChange,
    handleBlur,
    setTouched,
  };
}
