import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Lundi de la semaine ISO contenant `d`, en UTC pour éviter les décalages tz. */
export function mondayOf(d: Date = new Date()): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0=dim, 1=lun, ...
  const diff = (day + 6) % 7;   // lun=0, dim=6
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

export function weekLabel(start: string | Date): string {
  const d = typeof start === "string" ? new Date(start + "T00:00:00Z") : start;
  const end = addDays(d, 6);
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
  return `${fmt.format(d)} – ${fmt.format(end)}`;
}

/** Vérifie si une date weekStart correspond à la semaine en cours. */
export function isCurrentWeek(weekStart: string): boolean {
  const current = isoDate(mondayOf());
  return weekStart === current;
}

/** Vérifie si une semaine est passée (avant la semaine en cours). */
export function isPastWeek(weekStart: string): boolean {
  const current = isoDate(mondayOf());
  return weekStart < current;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

/** Palette couleurs stable à partir d'un nom. */
export function colorFromName(name: string): string {
  const palette = [
    "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c",
    "#ca8a04", "#16a34a", "#0d9488", "#0284c7", "#4f46e5",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
