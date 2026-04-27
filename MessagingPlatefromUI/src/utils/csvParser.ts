/**
 * CSV Parsing utilities for group phone number imports
 */

import {
  isValidIndianMobileNumber,
  normalizeIndianMobileNumber,
} from "./mobileValidation";

export interface CSVParseResult {
  phoneNumbers: string[];
  validCount: number;
  invalidCount: number;
  invalidPhoneNumbers: string[];
}

/**
 * Validates a single Indian mobile number format.
 */
function isValidPhoneNumber(phone: string): boolean {
  return (
    Boolean(phone) &&
    typeof phone === "string" &&
    isValidIndianMobileNumber(phone)
  );
}

/**
 * Normalizes a phone number to the 10-digit Indian mobile format.
 */
export function normalizePhoneNumber(phone: string): string {
  return normalizeIndianMobileNumber(phone);
}

/**
 * Parses a CSV file and extracts phone numbers
 * Supports various CSV formats and phone number locations
 * Returns validation results including valid and invalid phone numbers
 */
export async function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split("\n");

        const phoneNumbers: string[] = [];
        const invalidPhoneNumbers: string[] = [];
        const seenNumbers = new Set<string>();

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Skip empty lines and headers (common CSV patterns)
          if (
            !line ||
            line.toLowerCase().includes("phone") ||
            line.toLowerCase().includes("number") ||
            line.toLowerCase().includes("contact")
          ) {
            continue;
          }

          // Split by common delimiters and extract potential phone numbers
          const parts = line.split(",");

          for (const part of parts) {
            const cleaned = part.trim();

            if (!cleaned) continue;

            if (isValidPhoneNumber(cleaned)) {
              const normalized = normalizePhoneNumber(cleaned);
              // Avoid duplicates
              if (!seenNumbers.has(normalized)) {
                phoneNumbers.push(normalized);
                seenNumbers.add(normalized);
              }
            } else {
              // Only track invalid phone numbers that are non-empty and look like numbers
              if (cleaned && (cleaned.length > 5 || /\d/.test(cleaned))) {
                invalidPhoneNumbers.push(cleaned);
              }
            }
          }
        }

        resolve({
          phoneNumbers,
          validCount: phoneNumbers.length,
          invalidCount: invalidPhoneNumbers.length,
          invalidPhoneNumbers: invalidPhoneNumbers.slice(0, 10), // Return only first 10 for display
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to parse CSV file: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Downloads a CSV template for users to use for bulk upload
 */
export function downloadCSVTemplate(): void {
  const csv = `Phone Number
9876543210
9123456780
8901234567
7890123456`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "phone-numbers-template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}

/**
 * Validates CSV file before processing
 * Checks file size and type
 */
export function validateCSVFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (
    !file.type.includes("csv") &&
    !file.name.endsWith(".csv") &&
    file.type !== ""
  ) {
    return {
      valid: false,
      error: "Please upload a CSV file",
    };
  }

  // Check file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size must be less than 5MB",
    };
  }

  return { valid: true };
}
