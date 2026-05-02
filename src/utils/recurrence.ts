import { addDays, getDay, parseISO } from "date-fns";
import type { RecurrenceRule, Task } from "../types/models";
import { addByFrequency, toDateKey } from "./date";
import { createId } from "./ids";

export function getNextOccurrenceDate(task: Task) {
  if (!task.recurrence) return undefined;

  const source = task.dueDate ?? task.scheduledDate ?? task.completedAt ?? new Date().toISOString();
  const start = parseISO(source);
  const rule = task.recurrence;

  if (rule.frequency === "weekly" && rule.daysOfWeek?.length) {
    for (let offset = 1; offset <= 14; offset += 1) {
      const candidate = addDays(start, offset);
      if (rule.daysOfWeek.includes(getDay(candidate))) return toDateKey(candidate);
    }
  }

  const next = addByFrequency(start, rule.frequency, Math.max(1, rule.interval));
  if (rule.endDate && next > parseISO(rule.endDate)) return undefined;
  return toDateKey(next);
}

export function createNextRecurringTask(task: Task): Task | undefined {
  const nextDate = getNextOccurrenceDate(task);
  if (!nextDate) return undefined;
  const now = new Date().toISOString();

  return {
    ...task,
    id: createId("task"),
    status: "todo",
    dueDate: task.dueDate ? nextDate : undefined,
    scheduledDate: task.scheduledDate ? nextDate : task.dueDate ? undefined : nextDate,
    completedPomodoros: 0,
    actualFocusMinutes: 0,
    subtasks: task.subtasks.map((subtask) => ({
      ...subtask,
      id: createId("subtask"),
      completed: false,
      completedAt: undefined,
      createdAt: now,
    })),
    createdAt: now,
    updatedAt: now,
    completedAt: undefined,
    archivedAt: undefined,
  };
}

export function recurrenceLabel(rule?: RecurrenceRule) {
  if (!rule) return "";
  if (rule.frequency === "daily") return rule.interval === 1 ? "Daily" : `Every ${rule.interval} days`;
  if (rule.frequency === "weekly") return rule.interval === 1 ? "Weekly" : `Every ${rule.interval} weeks`;
  if (rule.frequency === "monthly") return rule.interval === 1 ? "Monthly" : `Every ${rule.interval} months`;
  return `Every ${rule.interval} days`;
}
