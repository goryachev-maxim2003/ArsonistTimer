import { AlertTriangle, Flame, ListChecks, Sparkles, Trophy } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppStore } from "../store/appStore";
import { humanDate, isDateToday, isOverdueDate, todayKey } from "../utils/date";
import { minutesToHuman } from "../utils/formatting";
import { sessionsByDay, summarizeStats } from "../utils/stats";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { TaskQuickAdd } from "../components/tasks/TaskQuickAdd";
import { TaskCard } from "../components/tasks/TaskCard";
import { TaskEditor } from "../components/tasks/TaskEditor";
import { useMemo, useState } from "react";
import type { Task } from "../types/models";

export function DashboardPage() {
  const tasks = useAppStore((state) => state.tasks);
  const sessions = useAppStore((state) => state.sessions);
  const stats = useAppStore((state) => state.stats);
  const projects = useAppStore((state) => state.projects);
  const streak = useAppStore((state) => state.streak);
  const timer = useAppStore((state) => state.timer);
  const setRoute = useAppStore((state) => state.setRoute);
  const summary = summarizeStats(stats, tasks, sessions, projects);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const todayTasks = tasks.filter((task) => task.status !== "archived" && task.status !== "completed" && (isDateToday(task.dueDate) || isDateToday(task.scheduledDate)));
  const overdue = tasks.filter((task) => task.status !== "completed" && task.status !== "archived" && isOverdueDate(task.dueDate));
  const suggested = useMemo(
    () =>
      [...tasks]
        .filter((task) => task.status !== "completed" && task.status !== "archived")
        .sort((a, b) => {
          const priority = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priority[b.priority] - priority[a.priority] || (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
        })[0],
    [tasks],
  );

  return (
    <div className="grid gap-5">
      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="glow">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{todayKey()}</p>
              <h2 className="mt-2 text-3xl font-bold">Good evening. Ready to ignite focus?</h2>
              <p className="mt-2 max-w-2xl text-[var(--muted)]">Everything stays local on this device. No account, no ads, no locked features.</p>
            </div>
            <Button variant="primary" icon={<Flame className="h-4 w-4" />} onClick={() => setRoute("focus")}>
              Open Focus
            </Button>
          </div>
        </Card>
        <Card title="Daily Goal" eyebrow="Progress">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{summary.today.completedSessions}</p>
              <p className="text-sm text-[var(--muted)]">completed pomodoros</p>
            </div>
            <Badge tone={summary.today.dailyGoalCompleted ? "success" : "primary"}>{summary.today.dailyGoalCompleted ? "done" : "in progress"}</Badge>
          </div>
        </Card>
      </section>

      {overdue.length > 0 && (
        <Card className="border-ember-danger/40 bg-ember-danger/10">
          <div className="flex flex-wrap items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-ember-danger" />
            <p className="font-semibold">{overdue.length} overdue task{overdue.length === 1 ? "" : "s"} need attention.</p>
            <Button variant="danger" onClick={() => setRoute("tasks")}>
              Review
            </Button>
          </div>
        </Card>
      )}

      <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card title="Quick Add" eyebrow="Capture">
          <TaskQuickAdd />
        </Card>
        <Card title="Active Timer" eyebrow={timer.status}>
          <p className="text-3xl font-bold tabular-nums">{Math.ceil(timer.remainingSeconds / 60)}m</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Mode: {timer.mode.replace("_", " ")}</p>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Card title="Today's Tasks" action={<Button onClick={() => setRoute("tasks")}>All tasks</Button>}>
          <div className="grid gap-3">
            {todayTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
            ))}
            {todayTasks.length === 0 && <p className="text-sm text-[var(--muted)]">No tasks yet. Create your first spark.</p>}
          </div>
        </Card>
        <div className="grid gap-5">
          <Card title="Streak" eyebrow="Momentum">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                <Trophy className="h-7 w-7" />
              </span>
              <div>
                <p className="text-3xl font-bold">{streak.currentStreak}</p>
                <p className="text-sm text-[var(--muted)]">best {streak.longestStreak} days</p>
              </div>
            </div>
          </Card>
          <Card title="Suggested Next" eyebrow="Priority">
            {suggested ? (
              <div>
                <p className="font-semibold">{suggested.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Due {humanDate(suggested.dueDate)} · {suggested.estimatedPomodoros}p</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No open tasks.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card title="Focus Today">
          <p className="text-3xl font-bold">{minutesToHuman(summary.today.totalFocusMinutes)}</p>
        </Card>
        <Card title="Tasks Done">
          <p className="text-3xl font-bold">{summary.today.completedTasks}</p>
        </Card>
        <Card title="Active Tasks">
          <p className="text-3xl font-bold">{summary.activeTasks}</p>
        </Card>
      </section>

      <Card title="Weekly Focus Preview" eyebrow="Last 14 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessionsByDay(sessions, 14)}>
              <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="minutes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <TaskEditor open={Boolean(editingTask)} task={editingTask} onClose={() => setEditingTask(undefined)} />
    </div>
  );
}
