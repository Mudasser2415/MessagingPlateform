import { z } from "zod";

export const INDIA_MOBILE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;

export const mobileNumberSchema = z
  .string()
  .trim()
  .regex(INDIA_MOBILE_REGEX, "Invalid Indian mobile number");

type MobileValidationOptions = {
  required?: boolean;
  emptyMessage?: string;
  invalidMessage?: string;
};

export function sanitizeMobileNumberInput(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function compactMobileNumber(value: string): string {
  return sanitizeMobileNumberInput(value).replace(/-/g, "");
}

export function normalizeIndianMobileNumber(value: string): string {
  const compact = compactMobileNumber(value);

  if (compact.startsWith("+91") && compact.length === 13) {
    return compact.slice(3);
  }

  if (compact.startsWith("91") && compact.length === 12) {
    return compact.slice(2);
  }

  return compact;
}

export function isValidIndianMobileNumber(value: string): boolean {
  return mobileNumberSchema.safeParse(compactMobileNumber(value)).success;
}

export function getMobileValidationError(
  value: string,
  options: MobileValidationOptions = {},
): string | undefined {
  const compact = compactMobileNumber(value);

  if (!compact) {
    return options.required
      ? options.emptyMessage || "Mobile number is required."
      : undefined;
  }

  const result = mobileNumberSchema.safeParse(compact);
  if (result.success) {
    return undefined;
  }

  return options.invalidMessage || "Invalid Indian mobile number";
}

export function normalizeMobileCollection(values: string[]): string[] {
  const seen = new Set<string>();

  return values.reduce<string[]>((accumulator, value) => {
    const normalized = normalizeIndianMobileNumber(value);

    if (!normalized || seen.has(normalized)) {
      return accumulator;
    }

    seen.add(normalized);
    accumulator.push(normalized);
    return accumulator;
  }, []);
}
