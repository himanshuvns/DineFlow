/**
 * Indian Phone Number Validation & Formatting Utility
 * Compliant with Department of Telecommunications (DoT) and E.164 standardization.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // E.164 format, e.g. "+919876543210"
  formatted: string;  // Formatted for display, e.g. "+91 98765 43210"
  error?: string;
}

/**
 * Validates an Indian mobile number.
 * Accepts:
 *  - 10 digits: "9876543210"
 *  - With country code: "+91 98765 43210", "+919876543210", "919876543210"
 *  - With leading zero: "09876543210"
 * Valid Indian mobile numbers must start with 6, 7, 8, or 9.
 */
export function validateIndianPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      normalized: "",
      formatted: "",
      error: "Phone number is required",
    };
  }

  // Remove spaces, hyphens, and parentheses
  const cleaned = input.trim().replace(/[\s\-\(\)]/g, "");

  let digits = "";
  if (cleaned.startsWith("+91")) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    digits = cleaned.slice(1);
  } else if (!cleaned.startsWith("+")) {
    digits = cleaned;
  } else {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: "Only Indian phone numbers (+91) are supported",
    };
  }

  // Must only contain numeric digits
  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: "Phone number must contain numbers only",
    };
  }

  if (digits.length < 10) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: `Phone number is incomplete (${digits.length}/10 digits)`,
    };
  }

  if (digits.length > 10) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: `Phone number exceeds 10 digits (${digits.length} digits)`,
    };
  }

  // Indian mobile prefixes must be 6, 7, 8, or 9
  const firstDigit = digits[0];
  if (!["6", "7", "8", "9"].includes(firstDigit)) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: "Indian mobile numbers must start with 6, 7, 8, or 9",
    };
  }

  const normalized = `+91${digits}`;
  const formatted = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

  return {
    isValid: true,
    normalized,
    formatted,
  };
}

/**
 * Real-time formatter while typing into a phone input field.
 */
export function formatIndianPhoneInput(val: string): string {
  if (!val) return "";
  const cleaned = val.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+91")) {
    const raw = cleaned.slice(3).replace(/\D/g, "").slice(0, 10);
    if (raw.length > 5) {
      return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
    } else if (raw.length > 0) {
      return `+91 ${raw}`;
    }
    return "+91 ";
  }

  const raw = cleaned.replace(/\D/g, "").slice(0, 10);
  if (raw.length > 5) {
    return `${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return raw;
}
