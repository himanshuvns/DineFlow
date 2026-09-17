/**
 * Unified Validation & Formatting Engine for DineFlow
 * Compliant with DoT / E.164, RBI IFSC, GSTN specifications, and enterprise security standards.
 */

// ─── Indian Mobile Number Validation & Formatting ──────────────────────────

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // E.164 format, e.g. "+919876543210"
  formatted: string;  // Display format, e.g. "+91 98765 43210"
  error?: string;
}

/**
 * Validates an Indian mobile number.
 * Accepts:
 *  - 10 digits: "9876543210"
 *  - With country code: "+91 98765 43210", "+919876543210", "919876543210"
 *  - With leading zero: "09876543210"
 * Must start with 6, 7, 8, or 9 per DoT specifications.
 */
export function validateIndianPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      normalized: "",
      formatted: "",
      error: "Mobile number is required",
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
      error: "Only Indian mobile numbers (+91) are supported",
    };
  }

  // Must only contain numeric digits
  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: "Mobile number must contain digits only",
    };
  }

  if (digits.length < 10) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: `Mobile number is incomplete (${digits.length}/10 digits)`,
    };
  }

  if (digits.length > 10) {
    return {
      isValid: false,
      normalized: "",
      formatted: input,
      error: `Mobile number exceeds 10 digits (${digits.length} digits)`,
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
 * Handles inputs with or without "+91" prefix.
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

// ─── Password Validation & Strength Engine ─────────────────────────────────

export interface PasswordCriteria {
  minLength: boolean;   // >= 8 characters
  hasUpper: boolean;    // At least one uppercase letter (A-Z)
  hasLower: boolean;    // At least one lowercase letter (a-z)
  hasNumber: boolean;   // At least one number (0-9)
  hasSpecial: boolean;  // At least one special character (!@#$%^&*...)
}

export type PasswordStrengthLevel = "empty" | "weak" | "medium" | "strong" | "very-strong";

export interface PasswordValidationResult {
  isValid: boolean;
  criteria: PasswordCriteria;
  score: number; // 0 to 5
  level: PasswordStrengthLevel;
  label: string;
  error?: string;
}

/**
 * Evaluates password complexity against the 5 enterprise security criteria
 * and computes dynamic strength level (Weak, Medium, Strong, Very Strong).
 */
export function validatePassword(password: string): PasswordValidationResult {
  const pwd = password || "";

  const criteria: PasswordCriteria = {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };

  let score = 0;
  if (criteria.minLength) score += 1;
  if (criteria.hasUpper) score += 1;
  if (criteria.hasLower) score += 1;
  if (criteria.hasNumber) score += 1;
  if (criteria.hasSpecial) score += 1;

  // Bonus for longer passwords
  if (pwd.length >= 12 && score === 5) {
    score = 5;
  }

  let level: PasswordStrengthLevel = "empty";
  let label = "";

  if (pwd.length === 0) {
    level = "empty";
    label = "Enter password";
  } else if (score <= 2) {
    level = "weak";
    label = "Weak";
  } else if (score === 3 || score === 4) {
    level = "medium";
    label = "Medium";
  } else if (score === 5 && pwd.length < 10) {
    level = "strong";
    label = "Strong";
  } else {
    level = "very-strong";
    label = "Very Strong";
  }

  const allCriteriaMet =
    criteria.minLength &&
    criteria.hasUpper &&
    criteria.hasLower &&
    criteria.hasNumber &&
    criteria.hasSpecial;

  let error: string | undefined = undefined;
  if (pwd.length > 0 && !allCriteriaMet) {
    if (!criteria.minLength) {
      error = "Password must be at least 8 characters";
    } else if (!criteria.hasUpper) {
      error = "Password must include at least one uppercase letter (A-Z)";
    } else if (!criteria.hasLower) {
      error = "Password must include at least one lowercase letter (a-z)";
    } else if (!criteria.hasNumber) {
      error = "Password must include at least one number (0-9)";
    } else if (!criteria.hasSpecial) {
      error = "Password must include at least one special character";
    }
  }

  return {
    isValid: allCriteriaMet,
    criteria,
    score,
    level,
    label,
    error,
  };
}

// ─── Confirm Password Matching ─────────────────────────────────────────────

export interface ConfirmPasswordResult {
  isValid: boolean;
  status: "empty" | "mismatch" | "match";
  message: string;
  error?: string;
}

export function validateConfirmPassword(password: string, confirmPassword: string): ConfirmPasswordResult {
  if (!confirmPassword) {
    return {
      isValid: false,
      status: "empty",
      message: "Re-enter your password to confirm",
    };
  }

  if (password === confirmPassword) {
    return {
      isValid: true,
      status: "match",
      message: "Passwords match",
    };
  }

  return {
    isValid: false,
    status: "mismatch",
    message: "Passwords do not match",
    error: "Passwords do not match",
  };
}

// ─── Email Validation ──────────────────────────────────────────────────────

export interface EmailValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      normalized: "",
      error: "Email address is required",
    };
  }

  const normalized = email.trim().toLowerCase();
  // RFC 5322 compatible regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: "Please enter a valid email address (e.g. chef@restaurant.com)",
    };
  }

  return {
    isValid: true,
    normalized,
  };
}

// ─── Name Validation ───────────────────────────────────────────────────────

export interface NameValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

export function validateName(name: string, fieldName = "Name", minLength = 2): NameValidationResult {
  const sanitized = (name || "").trim();
  if (!sanitized) {
    return {
      isValid: false,
      sanitized: "",
      error: `${fieldName} is required`,
    };
  }

  if (sanitized.length < minLength) {
    return {
      isValid: false,
      sanitized,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

// ─── Indian Bank IFSC Validation ───────────────────────────────────────────

export function validateIFSC(ifsc: string): { isValid: boolean; error?: string } {
  const cleaned = (ifsc || "").trim().toUpperCase();
  if (!cleaned) {
    return { isValid: false, error: "IFSC code is required" };
  }

  // 4 letters, 0, 6 letters or digits
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(cleaned)) {
    return {
      isValid: false,
      error: "Invalid IFSC format (e.g. HDFC0001234)",
    };
  }

  return { isValid: true };
}

// ─── Indian GSTIN Validation ───────────────────────────────────────────────

export function validateGSTIN(gstin: string): { isValid: boolean; error?: string } {
  const cleaned = (gstin || "").trim().toUpperCase();
  if (!cleaned) {
    return { isValid: true }; // GSTIN is usually optional
  }

  // 15 characters: 2 state code digits + 10 PAN chars + 1 entity code + 1 Z + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleaned)) {
    return {
      isValid: false,
      error: "Invalid 15-character GSTIN format (e.g. 27AABCU9603R1ZM)",
    };
  }

  return { isValid: true };
}
