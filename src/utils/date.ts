import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const DATE_KEY = "yyyy-MM-dd";

export function nowIso() {
  return new Date().toISOString();
}

export function todayKey() {
  return format(new Date(), DATE_KEY);
}

export function toDateKey(value: Date | string) {
  return format(typeof value === "string" ? parseISO(value) : value, DATE_KEY);
}

export function humanDate(value?: string) {
  if (!value) return "No date";
  const parsed = parseISO(value);
  if (isToday(parsed)) return "Today";
  if (isTomorrow(parsed)) return "Tomorrow";
  return format(parsed, "MMM d");
}

export function humanDateTime(value?: string) {
  if (!value) return "";
  return format(parseISO(value), "MMM d, HH:mm");
}

export function isOverdueDate(value?: string) {
  if (!value) return false;
  return differenceInCalendarDays(parseISO(value), new Date()) < 0;
}

export function isDateToday(value?: string) {
  return value ? isSameDay(parseISO(value), new Date()) : false;
}

export function getMonthDays(anchor = new Date()) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfMonth(anchor);
  const cells: Date[] = [];
  let cursor = start;

  while (cells.length < 42) {
    cells.push(cursor);
    cursor = addDays(cursor, 1);
    if (cursor > end && cells.length % 7 === 0 && cells.length >= 35) break;
  }

  return cells;
}

export function getWeekKeys(anchor = new Date()) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

export function addByFrequency(date: Date, frequency: "daily" | "weekly" | "monthly" | "custom", interval: number) {
  if (frequency === "weekly") return addWeeks(date, interval);
  if (frequency === "monthly") return addMonths(date, interval);
  return addDays(date, interval);
}
