import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance as fnsFormatDistance, parseISO, isToday, isTomorrow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "EEEE, MMMM d"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatTime(time?: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export function getDayLabel(date: string): string {
  const d = parseISO(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE");
}

export function getCountdown(date: string): string {
  const d = parseISO(date);
  if (isPast(d) && !isToday(d)) return "Completed";
  return fnsFormatDistance(d, new Date(), { addSuffix: true });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getMapsUrl(address: string, platform: "google" | "apple"): string {
  const encoded = encodeURIComponent(address);
  if (platform === "google") {
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }
  return `http://maps.apple.com/?q=${encoded}`;
}

export function getDirectionsUrl(
  from: string,
  to: string,
  platform: "google" | "apple"
): string {
  if (platform === "google") {
    return `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
  }
  return `http://maps.apple.com/?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}`;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function categoryColor(category?: string): string {
  const map: Record<string, string> = {
    sightseeing: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    transport: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    accommodation: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    outdoor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    culture: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    other: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  };
  return map[category ?? "other"] ?? map.other;
}
