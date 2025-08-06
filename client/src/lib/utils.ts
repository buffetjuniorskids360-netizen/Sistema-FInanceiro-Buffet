import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize Brazilian currency or numeric inputs to a dot-decimal string with 2 fraction digits.
 * Accepts numbers or strings with comma or dot separators.
 * Examples:
 *  - "1.234,56" -> "1234.56"
 *  - "1234,5" -> "1234.50"
 *  - 1234.5 -> "1234.50"
 */
export function toDecimalString(input: string | number): string {
  if (typeof input === "number") {
    return input.toFixed(2);
  }
  const s = (input ?? "").toString().trim();
  if (!s) return "0.00";
  // Remove currency symbols and spaces
  let cleaned = s.replace(/[^\d,.-]/g, "");
  // If both comma and dot exist, assume comma is decimal and dot is thousand
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // Only comma exists, treat as decimal separator
    cleaned = cleaned.replace(",", ".");
  }
  const num = Number(cleaned);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
}

/**
 * Convert date input to YYYY-MM-DD.
 * Accepts:
 *  - "YYYY-MM-DD"
 *  - "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
 *  - Date instance
 */
export function toDateYYYYMMDD(input: string | Date): string {
  if (input instanceof Date) {
    const iso = new Date(input.getTime() - input.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 10);
  }
  const s = (input ?? "").toString();
  if (!s) return "";
  if (s.includes("T")) return s.split("T")[0];
  // Try parse as Date
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 10);
  }
  // Fallback assume already YYYY-MM-DD
  return s;
}

/**
 * Convert time input to HH:mm.
 * Accepts:
 *  - "HH:mm"
 *  - "HH:mm:ss"
 *  - Date instance
 */
export function toTimeHHMM(input: string | Date): string {
  if (input instanceof Date) {
    const hh = String(input.getHours()).padStart(2, "0");
    const mm = String(input.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const s = (input ?? "").toString();
  if (!s) return "00:00";
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  // Attempt to parse a datetime-local string
  if (s.includes("T")) {
    const timePart = s.split("T")[1] || "00:00";
    return toTimeHHMM(timePart);
  }
  // Fallback
  return "00:00";
}
