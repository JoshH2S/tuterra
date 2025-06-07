import { format, parseISO, isValid, addDays, startOfWeek, endOfWeek, isToday, isTomorrow, isYesterday, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Get the user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a UTC date string to user's local timezone
 */
export function convertToUserTimezone(utcDateString: string): Date {
  if (!utcDateString) return new Date();
  
  try {
    const utcDate = parseISO(utcDateString);
    if (!isValid(utcDate)) return new Date();
    
    const userTz = getUserTimezone();
    return toZonedTime(utcDate, userTz);
  } catch (error) {
    console.error('Error converting to user timezone:', error);
    return new Date();
  }
}

/**
 * Convert a local date to UTC for storage
 */
export function convertToUTC(localDate: Date): Date {
  try {
    const userTz = getUserTimezone();
    return fromZonedTime(localDate, userTz);
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return localDate;
  }
}

/**
 * Format a date string in user's timezone
 */
export function formatInUserTimezone(dateString: string, formatPattern: string = 'MMM d, yyyy \'at\' h:mm a'): string {
  try {
    const localDate = convertToUserTimezone(dateString);
    return format(localDate, formatPattern);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Check if a task is overdue (timezone-aware)
 */
export function isTaskOverdue(dueDateString: string): boolean {
  if (!dueDateString) return false;
  
  try {
    const localDueDate = convertToUserTimezone(dueDateString);
    const now = new Date();
    return now > localDueDate;
  } catch (error) {
    console.error('Error checking overdue status:', error);
    return false;
  }
}

/**
 * Get relative time description (e.g., "Due in 2 hours", "Overdue by 1 day")
 */
export function getRelativeDeadlineText(dueDateString: string): string {
  if (!dueDateString) return 'No deadline set';
  
  try {
    const localDueDate = convertToUserTimezone(dueDateString);
    const now = new Date();
    
    if (isToday(localDueDate)) {
      const hoursUntil = differenceInHours(localDueDate, now);
      const minutesUntil = differenceInMinutes(localDueDate, now);
      
      if (hoursUntil < 0) {
        const hoursOverdue = Math.abs(hoursUntil);
        return hoursOverdue < 1 
          ? `Overdue by ${Math.abs(minutesUntil)} minutes`
          : `Overdue by ${hoursOverdue} hours`;
      } else if (hoursUntil < 1) {
        return `Due in ${minutesUntil} minutes`;
      } else {
        return `Due in ${hoursUntil} hours`;
      }
    } else if (isTomorrow(localDueDate)) {
      return `Due tomorrow at ${format(localDueDate, 'h:mm a')}`;
    } else if (isYesterday(localDueDate)) {
      return 'Overdue by 1 day';
    } else {
      const daysUntil = differenceInDays(localDueDate, now);
      if (daysUntil < 0) {
        return `Overdue by ${Math.abs(daysUntil)} days`;
      } else {
        return `Due in ${daysUntil} days`;
      }
    }
  } catch (error) {
    console.error('Error getting relative deadline text:', error);
    return 'Invalid deadline';
  }
}

/**
 * Create a calendar event URL for various calendar providers
 */
export function createCalendarEventUrl(
  title: string,
  startDate: string,
  endDate?: string,
  description?: string,
  location?: string,
  provider: 'google' | 'outlook' | 'apple' = 'google'
): string {
  const start = convertToUserTimezone(startDate);
  const end = endDate ? convertToUserTimezone(endDate) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration
  
  const formatForUrl = (date: Date) => {
    // Format as YYYYMMDDTHHMMSSZ for calendar URLs
    return format(convertToUTC(date), "yyyyMMdd'T'HHmmss'Z'");
  };
  
  const startFormatted = formatForUrl(start);
  const endFormatted = formatForUrl(end);
  
  const params = new URLSearchParams();
  
  switch (provider) {
    case 'google':
      params.append('action', 'TEMPLATE');
      params.append('text', title);
      params.append('dates', `${startFormatted}/${endFormatted}`);
      if (description) params.append('details', description);
      if (location) params.append('location', location);
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
      
    case 'outlook':
      params.append('subject', title);
      params.append('startdt', startFormatted);
      params.append('enddt', endFormatted);
      if (description) params.append('body', description);
      if (location) params.append('location', location);
      return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
      
    case 'apple':
      // Apple Calendar uses webcal:// protocol or .ics files
      // For now, return a data URL with ICS content
      const icsContent = generateICSContent(title, start, end, description, location);
      return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
      
    default:
      return createCalendarEventUrl(title, startDate, endDate, description, location, 'google');
  }
}

/**
 * Generate ICS calendar content
 */
function generateICSContent(
  title: string,
  startDate: Date,
  endDate: Date,
  description?: string,
  location?: string
): string {
  const formatICSDate = (date: Date) => format(convertToUTC(date), "yyyyMMdd'T'HHmmss'Z'");
  
  const now = new Date();
  const uid = `${now.getTime()}@tuterra.app`;
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tuterra//Virtual Internship//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${title}`,
    ...(description ? [`DESCRIPTION:${description.replace(/\n/g, '\\n')}`] : []),
    ...(location ? [`LOCATION:${location}`] : []),
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Calculate business day deadline (next business day at 5 PM in user's timezone)
 */
export function calculateBusinessDeadline(daysFromNow: number = 7): Date {
  const now = new Date();
  let deadline = addDays(now, daysFromNow);
  
  // If it falls on weekend, move to next Monday
  const dayOfWeek = deadline.getDay();
  if (dayOfWeek === 0) { // Sunday
    deadline = addDays(deadline, 1);
  } else if (dayOfWeek === 6) { // Saturday
    deadline = addDays(deadline, 2);
  }
  
  // Set to 5 PM (17:00) in user's timezone
  deadline.setHours(17, 0, 0, 0);
  
  return deadline;
}

/**
 * Get deadline urgency level
 */
export function getDeadlineUrgency(dueDateString: string): 'overdue' | 'urgent' | 'soon' | 'normal' {
  if (!dueDateString) return 'normal';
  
  try {
    const localDueDate = convertToUserTimezone(dueDateString);
    const now = new Date();
    const hoursUntil = differenceInHours(localDueDate, now);
    
    if (hoursUntil < 0) return 'overdue';
    if (hoursUntil <= 24) return 'urgent';
    if (hoursUntil <= 72) return 'soon';
    return 'normal';
  } catch (error) {
    console.error('Error getting deadline urgency:', error);
    return 'normal';
  }
}

/**
 * Format a deadline for display with appropriate styling context
 */
export function formatDeadlineWithContext(dueDateString: string): {
  text: string;
  urgency: 'overdue' | 'urgent' | 'soon' | 'normal';
  fullDate: string;
  relativeText: string;
} {
  const urgency = getDeadlineUrgency(dueDateString);
  const fullDate = formatInUserTimezone(dueDateString, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
  const relativeText = getRelativeDeadlineText(dueDateString);
  
  let text: string;
  switch (urgency) {
    case 'overdue':
      text = relativeText;
      break;
    case 'urgent':
      text = `Due ${formatInUserTimezone(dueDateString, 'h:mm a')} today`;
      break;
    case 'soon':
      text = formatInUserTimezone(dueDateString, 'MMM d \'at\' h:mm a');
      break;
    default:
      text = formatInUserTimezone(dueDateString, 'MMM d, yyyy');
      break;
  }
  
  return {
    text,
    urgency,
    fullDate,
    relativeText
  };
}

/**
 * Check if user's system supports calendar integration
 */
export function canIntegrateWithCalendar(): boolean {
  // Check if the browser supports the File System Access API or similar
  return typeof window !== 'undefined' && (
    'showSaveFilePicker' in window ||
    'showOpenFilePicker' in window ||
    navigator.userAgent.includes('Chrome') ||
    navigator.userAgent.includes('Safari') ||
    navigator.userAgent.includes('Firefox')
  );
}

/**
 * Download an ICS file for a task deadline
 */
export function downloadTaskDeadlineAsICS(
  taskTitle: string,
  dueDateString: string,
  description?: string
): void {
  try {
    const dueDate = convertToUserTimezone(dueDateString);
    const reminderDate = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    
    const icsContent = generateICSContent(
      `📋 Task Deadline: ${taskTitle}`,
      reminderDate,
      dueDate,
      description ? `Task: ${taskTitle}\n\n${description}\n\nDeadline: ${formatInUserTimezone(dueDateString)}` : `Task deadline for: ${taskTitle}`,
      'Virtual Internship Platform'
    );
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${taskTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deadline.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading ICS file:', error);
  }
} 