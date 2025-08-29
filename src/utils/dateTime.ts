// Utility functions for consistent Indian local time formatting
const INDIAN_TIMEZONE = 'Asia/Kolkata';
const INDIAN_LOCALE = 'en-IN';

export const formatIndianDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatIndianDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatIndianTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatIndianDateLong = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const formatIndianDateShort = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
};

export const formatCurrentIndianTime = (): string => {
  return new Date().toLocaleTimeString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const getCurrentIndianDateTime = (): string => {
  const now = new Date();
  const indianTime = now.toLocaleString(INDIAN_LOCALE, {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  console.log('Current IST time:', indianTime, 'UTC time:', now.toISOString());
  return indianTime;
};

// Get current date in Indian timezone as ISO string for comparisons
export const getCurrentIndianDateISO = (): string => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: INDIAN_TIMEZONE
  }); // en-CA gives YYYY-MM-DD format
};

// Check if a date is today in Indian timezone
export const isToday = (date: string | Date): boolean => {
  const today = getCurrentIndianDateISO();
  const dateToCheck = new Date(date).toLocaleDateString('en-CA', {
    timeZone: INDIAN_TIMEZONE
  });
  return today === dateToCheck;
};