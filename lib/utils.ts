import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  // Within a week
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return format(date, "EEE"); // Mon, Tue, etc.
  }

  return format(date, "MMM d");
}

export function formatFullDate(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return format(date, "MMM d, yyyy · h:mm a");
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function getRelativeGroupDate(dateStr: string | Date): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  // Within a week
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return format(date, "EEEE"); // Monday, Tuesday, etc.
  }

  return format(date, "MMMM d, yyyy");
}
