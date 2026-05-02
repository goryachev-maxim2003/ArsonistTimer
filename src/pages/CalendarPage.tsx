import { addMonths, format, isSameMonth, parseISO } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppStore } from "../store/appStore";
import type { Task } from "../types/models";
import { getMonthDays, todayKey, toDateKey } from "../utils/date";
import { minutesToHuman } from "../utils/formatting";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { TaskEditor } from "../components/tasks/TaskEditor";
import { TaskCard } from "../components/tasks/TaskCard";
import { TaskQuickAdd } from "../components/tasks/TaskQuickAdd";
import { useI18n } from "../hooks/useI18n";

export function CalendarPage() {
  const tasks = useAppStore((state) => state.tasks);
  const stats = useAppStore((state) => state.stats);
  const { language } = useI18n();
  const dateLocale = language === "ru" ? ru : enUS;
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const days = useMemo(() => getMonthDays(anchor), [anchor]);
  const selectedTasks = tasks.filter((task) => (task.dueDate === selectedDate || task.scheduledDate === selectedDate) && task.status !== "archived");

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
      <Card
        title={format(anchor, "MMMM yyyy", { locale: dateLocale })}
        eyebrow="Calendar"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" icon={<ChevronLeft className="h-4 w-4" />} aria-label="Previous month" onClick={() => setAnchor(addMonths(anchor, -1))} />
            <Button variant="ghost" icon={<ChevronRight className="h-4 w-4" />} aria-label="Next month" onClick={() => setAnchor(addMonths(anchor, 1))} />
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const key = toDateKey(day);
            const dayTasks = tasks.filter((task) => task.dueDate === key || task.scheduledDate === key);
            const completed = dayTasks.filter((task) => task.status === "completed").length;
            const focusMinutes = stats.find((item) => item.date === key)?.totalFocusMinutes ?? 0;
            const active = selectedDate === key;
            return (
              <button
                key={key}
                className={`min-h-28 rounded-lg border p-2 text-left transition ${
                  active ? "border-[var(--primary)] bg-[var(--primary)]/15" : "border-[var(--border)] hover:border-[var(--primary)]/60"
                } ${isSameMonth(day, anchor) ? "" : "opacity-45"}`}
                onClick={() => setSelectedDate(key)}
              >
                <span className="font-semibold">{format(day, "d")}</span>
                <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                  <p>{dayTasks.length} tasks</p>
                  <p>{completed} done</p>
                  <p>{minutesToHuman(focusMinutes)}</p>
                </div>
                <div className="mt-2 flex gap-1">
                  {dayTasks.slice(0, 4).map((task) => (
                    <span key={task.id} className="h-1.5 w-4 rounded-full bg-[var(--primary)]" />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <aside className="grid gap-5">
        <Card title={format(parseISO(selectedDate), "MMMM d", { locale: dateLocale })} eyebrow="Day View" action={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setEditorOpen(true)}>New</Button>}>
          <TaskQuickAdd date={selectedDate} />
          <div className="mt-4 grid gap-3">
            {selectedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
            ))}
            {selectedTasks.length === 0 && <p className="text-sm text-[var(--muted)]">No tasks on this day.</p>}
          </div>
        </Card>
      </aside>

      <TaskEditor open={editorOpen} presetDate={selectedDate} onClose={() => setEditorOpen(false)} />
      <TaskEditor open={Boolean(editingTask)} task={editingTask} onClose={() => setEditingTask(undefined)} />
    </div>
  );
}
