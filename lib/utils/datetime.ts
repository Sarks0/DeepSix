/**
 * Datetime utility functions for consistent timezone handling across the application
 * All timestamps should be stored/transmitted as UTC and displayed in user's local timezone
 */

/**
 * Get the user's timezone abbreviation (e.g., "PST", "EST", "UTC")
 */
export function getUserTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();

    // Get the timezone abbreviation
    const shortFormat = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });

    const parts = shortFormat.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');

    return timeZonePart?.value || timezone;
  } catch (error) {
    return 'Local';
  }
}

/**
 * Get the full timezone name (e.g., "America/Los_Angeles")
 */
export function getUserTimezoneFull(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC';
  }
}

/**
 * Format a date/time in user's local timezone with explicit timezone indicator
 * @param date - Date object, ISO string, or timestamp
 * @param options - Formatting options
 */
export function formatLocalDateTime(
  date: Date | string | number,
  options: {
    showDate?: boolean;
    showTime?: boolean;
    showTimezone?: boolean;
    showSeconds?: boolean;
  } = {}
): string {
  const {
    showDate = true,
    showTime = true,
    showTimezone = true,
    showSeconds = true,
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const parts: string[] = [];

  if (showDate) {
    const dateStr = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    parts.push(dateStr);
  }

  if (showTime) {
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: false,
    });
    parts.push(timeStr);
  }

  const result = parts.join(' ');

  if (showTimezone) {
    const tz = getUserTimezone();
    return `${result} ${tz}`;
  }

  return result;
}

/**
 * Format a date in user's local timezone
 */
export function formatLocalDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time in user's local timezone
 */
export function formatLocalTime(date: Date | string | number, showSeconds = true): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: false,
  });
}

/**
 * Format a date/time in UTC explicitly
 */
export function formatUTC(
  date: Date | string | number,
  options: {
    showDate?: boolean;
    showTime?: boolean;
    showSeconds?: boolean;
  } = {}
): string {
  const {
    showDate = true,
    showTime = true,
    showSeconds = true,
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const parts: string[] = [];

  if (showDate) {
    const dateStr = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    parts.push(dateStr);
  }

  if (showTime) {
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: false,
      timeZone: 'UTC',
    });
    parts.push(timeStr);
  }

  return `${parts.join(' ')} UTC`;
}

/**
 * Format time for a specific timezone
 */
export function formatTimeInTimezone(
  date: Date | string | number,
  timezone: string,
  showSeconds = true
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  try {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: false,
      timeZone: timezone,
    });
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC';
  }
}

/**
 * Get timezone abbreviation for a specific timezone
 */
export function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const shortFormat = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });

    const parts = shortFormat.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');

    return timeZonePart?.value || timezone;
  } catch (error) {
    return timezone;
  }
}

/**
 * Relative time formatter (e.g., "2 minutes ago", "in 5 days")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSecs) < 60) {
    return 'just now';
  } else if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}` : `${Math.abs(diffMins)} minute${diffMins !== -1 ? 's' : ''} ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${diffHours !== -1 ? 's' : ''} ago`;
  } else if (Math.abs(diffDays) < 30) {
    return diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${diffDays !== -1 ? 's' : ''} ago`;
  } else {
    return formatLocalDate(dateObj);
  }
}
