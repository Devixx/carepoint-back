/**
 * Centralized date utility functions for the CarePoint backend
 * Provides consistent date parsing, formatting, and manipulation across the application
 */

/**
 * Parse a date string to a Date object
 * Handles ISO date strings and validates the result
 * @param dateString - ISO date string or date string
 * @returns Date object or undefined if invalid
 * @throws Error if date string is invalid
 */
export function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) {
    return undefined;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  return date;
}

/**
 * Parse and validate a date string, throwing an error if invalid
 * @param dateString - ISO date string
 * @param fieldName - Name of the field for error messages
 * @returns Date object
 * @throws Error if date string is invalid
 */
export function parseAndValidateDate(
  dateString: string,
  fieldName: string = "date",
): Date {
  const date = parseDate(dateString);
  if (!date) {
    throw new Error(`Invalid ${fieldName}: ${dateString}`);
  }
  return date;
}

/**
 * Get the start of a day (00:00:00.000) for a given date
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @returns Date object at start of day in UTC
 */
export function getStartOfDay(date: string | Date): Date {
  if (typeof date === "string") {
    return new Date(`${date}T00:00:00.000Z`);
  }
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Get the end of a day (23:59:59.999) for a given date
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @returns Date object at end of day in UTC
 */
export function getEndOfDay(date: string | Date): Date {
  if (typeof date === "string") {
    return new Date(`${date}T23:59:59.999Z`);
  }
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Get start and end of day as a range
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @returns Object with start and end Date objects
 */
export function getDayRange(date: string | Date): { start: Date; end: Date } {
  return {
    start: getStartOfDay(date),
    end: getEndOfDay(date),
  };
}

/**
 * Create a date range from start and end date strings
 * @param startDate - Start date string (YYYY-MM-DD) or undefined
 * @param endDate - End date string (YYYY-MM-DD) or undefined
 * @returns Object with start and end Date objects, or undefined if both are missing
 */
export function createDateRange(
  startDate?: string,
  endDate?: string,
): { start: Date; end: Date } | undefined {
  if (!startDate && !endDate) {
    return undefined;
  }

  const start = startDate ? getStartOfDay(startDate) : undefined;
  const end = endDate ? getEndOfDay(endDate) : undefined;

  if (start && end) {
    return { start, end };
  }

  return undefined;
}

/**
 * Add days to a date
 * @param date - Date object or date string
 * @param days - Number of days to add (can be negative)
 * @returns New Date object
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to a date
 * @param date - Date object or date string
 * @param hours - Number of hours to add (can be negative)
 * @returns New Date object
 */
export function addHours(date: Date | string, hours: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 * @param date - Date object or date string
 * @param minutes - Number of minutes to add (can be negative)
 * @returns New Date object
 */
export function addMinutes(date: Date | string, minutes: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const result = new Date(dateObj);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Format a date to ISO string
 * @param date - Date object
 * @returns ISO string representation
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format a date to locale date string
 * @param date - Date object
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function toLocaleDateString(
  date: Date,
  locale: string | Intl.DateTimeFormatOptions = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  if (typeof locale === "object") {
    // If first param is options object
    return date.toLocaleDateString("en-US", locale);
  }
  return date.toLocaleDateString(locale, options);
}

/**
 * Format a date to locale time string
 * @param date - Date object
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function toLocaleTimeString(
  date: Date,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  return date.toLocaleTimeString(locale, options);
}

/**
 * Format a date to a specific format string
 * @param date - Date object
 * @param format - Format string (YYYY-MM-DD, HH:mm, etc.)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * Get time in HH:mm format from a date
 * @param date - Date object
 * @param useUTC - Whether to use UTC time (default: false)
 * @returns Time string in HH:mm format
 */
export function getTimeString(date: Date, useUTC: boolean = false): string {
  const hours = useUTC ? date.getUTCHours() : date.getHours();
  const minutes = useUTC ? date.getUTCMinutes() : date.getMinutes();
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Check if a date is valid
 * @param date - Date object or date string
 * @returns True if date is valid, false otherwise
 */
export function isValidDate(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
}

/**
 * Check if a date is in the past
 * @param date - Date object or date string
 * @returns True if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 * @param date - Date object or date string
 * @returns True if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Check if a date is today
 * @param date - Date object or date string
 * @returns True if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get the current date/time
 * @returns Current Date object
 */
export function now(): Date {
  return new Date();
}

/**
 * Get the current date as ISO string
 * @returns Current date as ISO string
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Get the current date as YYYY-MM-DD string
 * @returns Current date as YYYY-MM-DD string
 */
export function todayString(): string {
  return formatDate(new Date(), "YYYY-MM-DD");
}

/**
 * Generate time slots between start and end time
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @param intervalMinutes - Interval between slots in minutes (default: 30)
 * @returns Array of time strings in HH:mm format
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30,
): string[] {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  const slots: string[] = [];
  for (let minutes = start; minutes < end; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
  }

  return slots;
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 * @param timeString - Time string in HH:mm format
 * @returns Minutes since midnight
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 * @param minutes - Minutes since midnight
 * @returns Time string in HH:mm format
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

