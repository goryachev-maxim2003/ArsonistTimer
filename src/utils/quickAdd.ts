import { addDays, nextMonday } from "date-fns";
import type { Priority, RecurrenceRule } from "../types/models";
import { toDateKey } from "./date";

export interface ParsedQuickAdd {
  title: string;
  priority: Priority;
  dueDate?: string;
  estimatedPomodoros: number;
  tagNames: string[];
  recurrence?: RecurrenceRule;
}

const priorities: Priority[] = ["urgent", "high", "medium", "low"];

export function parseQuickAdd(text: string): ParsedQuickAdd {
  const tokens = text.trim().split(/\s+/);
  const consumed = new Set<number>();
  const tagNames: string[] = [];
  let priority: Priority = "medium";
  let dueDate: string | undefined;
  let estimatedPomodoros = 1;
  let recurrence: RecurrenceRule | undefined;

  tokens.forEach((token, index) => {
    const lower = token.toLowerCase();
    if (lower.startsWith("#") && lower.length > 1) {
      tagNames.push(lower.slice(1));
      consumed.add(index);
      return;
    }
    if (priorities.includes(lower as Priority)) {
      priority = lower as Priority;
      consumed.add(index);
      return;
    }
    if (/^\d+p$/i.test(lower)) {
      estimatedPomodoros = Math.max(0, Number.parseInt(lower, 10));
      consumed.add(index);
      return;
    }
    if (lower === "today") {
      dueDate = toDateKey(new Date());
      consumed.add(index);
      return;
    }
    if (lower === "tomorrow") {
      dueDate = toDateKey(addDays(new Date(), 1));
      consumed.add(index);
    }
  });

  tokens.forEach((token, index) => {
    const lower = token.toLowerCase();
    if (lower === "every" && tokens[index + 1]?.toLowerCase() === "monday") {
      recurrence = { frequency: "weekly", interval: 1, daysOfWeek: [1] };
      dueDate = toDateKey(nextMonday(new Date()));
      consumed.add(index);
      consumed.add(index + 1);
    }
  });

  const title = tokens.filter((_, index) => !consumed.has(index)).join(" ").trim() || text.trim();
  return { title, priority, dueDate, estimatedPomodoros, tagNames, recurrence };
}
