/** Strips control characters and trims user-supplied text (Mission S1D XSS readiness). */
export function sanitizeTextInput(value: string, maxLength = 512): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Validates email format for authentication inputs. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Validates password meets minimum length for alpha environments. */
export function isValidPassword(value: string): boolean {
  return value.length >= 6 && value.length <= 128;
}
