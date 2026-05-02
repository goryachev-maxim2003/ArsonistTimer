import { addDays, eachDayOfInterval, endOfMonth, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { useAppStore } from "../store/appStore";
import { toDateKey, todayKey } from "../utils/date";
import { minutesToHuman } from "../utils/formatting";

function monthDays(anchor: Date) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function daySessions(sessions: ReturnType<typeof useAppStore.getState>["sessions"], date: string) {
  return sessions.filter((session) => session.mode === "focus" && session.status !== "cancelled" && toDateKey(session.startedAt) === date);
}

function totalMinutes(sessions: ReturnType<typeof useAppStore.getState>["sessions"]) {
  return sessions.reduce((sum, session) => sum + session.actualDurationMinutes, 0);
}

function rangeSummary(sessions: ReturnType<typeof useAppStore.getState>["sessions"], from: Date, to: Date) {
  const filtered = sessions.filter((session) => {
    const date = parseISO(session.startedAt);
    return session.mode === "focus" && session.status !== "cancelled" && date >= from && date <= to;
  });
  return {
    sessions: filtered,
    minutes: totalMinutes(filtered),
  };
}

function dailyFocusMinutesMap(sessions: ReturnType<typeof useAppStore.getState>["sessions"]) {
  return sessions.reduce<Record<string, number>>((items, session) => {
    if (session.mode !== "focus" || session.status === "cancelled") return items;
    const key = toDateKey(session.startedAt);
    items[key] = (items[key] ?? 0) + session.actualDurationMinutes;
    return items;
  }, {});
}

function FocusJournal() {
  const sessions = useAppStore((state) => state.sessions);
  const tasks = useAppStore((state) => state.tasks);
  const [periodOffset, setPeriodOffset] = useState(0);
  const periodEnd = subDays(new Date(), periodOffset * 14);
  const periodStart = subDays(periodEnd, 13);
  const days = eachDayOfInterval({ start: periodStart, end: periodEnd }).reverse();
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const periodLabel = `${format(periodStart, "d MMM", { locale: ru })} - ${format(periodEnd, "d MMM yyyy", { locale: ru })}`;

  return (
    <Card
      title="Журнал фокуса"
      eyebrow="Дни и часы"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--primary)]"
            onClick={() => setPeriodOffset((offset) => offset + 1)}
          >
            Раньше
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={periodOffset === 0}
            onClick={() => setPeriodOffset((offset) => Math.max(0, offset - 1))}
          >
            Позже
          </button>
        </div>
      }
    >
      <p className="mb-3 text-sm text-[var(--muted)]">{periodLabel}</p>
      <div className="overflow-x-auto">
        <div className="min-w-[880px]">
          <div className="grid grid-cols-[5rem_1fr] text-sm text-[var(--muted)]">
            <div />
            <div className="grid grid-cols-12">
              {Array.from({ length: 12 }, (_, index) => index * 2).map((hour) => (
                <div key={hour} className="border-l border-[var(--border)] pl-1">
                  {hour}:00
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 grid gap-1">
            {days.map((day) => {
              const key = toDateKey(day);
              const label = key === todayKey() ? "Сегодня" : format(day, "d MMM", { locale: ru });
              const entries = daySessions(sessions, key);
              return (
                <div key={key} className="grid grid-cols-[5rem_1fr] items-center">
                  <div className="text-sm text-[var(--muted)]">{label}</div>
                  <div className="relative grid h-8 border-b border-[var(--border)] bg-white/[0.02]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                    {hours.map((hour) => (
                      <span key={hour} className="border-l border-[var(--border)]" />
                    ))}
                    {entries.map((session) => {
                      const start = parseISO(session.startedAt);
                      const startMinutes = start.getHours() * 60 + start.getMinutes();
                      const left = (startMinutes / 1440) * 100;
                      const width = Math.max(0.35, (session.actualDurationMinutes / 1440) * 100);
                      const task = tasks.find((item) => item.id === session.taskId);
                      return (
                        <span
                          key={session.id}
                          title={`${task?.title ?? "Фокус"}: ${minutesToHuman(session.actualDurationMinutes)}`}
                          className="absolute top-1 h-6 rounded-sm bg-blue-500"
                          style={{ left: `${left}%`, width: `${width}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function StatsPage() {
  const sessions = useAppStore((state) => state.sessions);
  const tasks = useAppStore((state) => state.tasks);
  const settings = useAppStore((state) => state.settings);
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [dailyChartOffset, setDailyChartOffset] = useState(0);
  const selectedSessions = daySessions(sessions, selectedDate);
  const selectedMinutes = totalMinutes(selectedSessions);
  const selectedTasks = selectedSessions.reduce<Array<{ title: string; minutes: number }>>((items, session) => {
    const title = tasks.find((task) => task.id === session.taskId)?.title ?? "Без задачи";
    const existing = items.find((item) => item.title === title);
    if (existing) existing.minutes += session.actualDurationMinutes;
    else items.push({ title, minutes: session.actualDurationMinutes });
    return items;
  }, []);
  const month = rangeSummary(sessions, startOfMonth(anchor), endOfMonth(anchor));
  const week = rangeSummary(sessions, startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), addDays(startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), 6));
  const workDaysPerWeek = Math.min(7, Math.max(1, Math.round(settings.dailyGoal.workDaysPerWeek ?? 5)));
  const weekAverageMinutes = Math.round(week.minutes / workDaysPerWeek);
  const weekAveragePomodoros = settings.timer.focusMinutes > 0 ? weekAverageMinutes / settings.timer.focusMinutes : 0;
  const dailyMinutesByDate = useMemo(() => dailyFocusMinutesMap(sessions), [sessions]);
  const allTimeDailyMaxMinutes = Math.max(1, ...Object.values(dailyMinutesByDate));
  const dailyChartEnd = subDays(new Date(), dailyChartOffset * 14);
  const dailyChartStart = subDays(dailyChartEnd, 13);
  const dailyChartLabel = `${format(dailyChartStart, "d MMM", { locale: ru })} - ${format(dailyChartEnd, "d MMM yyyy", { locale: ru })}`;

  const dailyChart = useMemo(
    () =>
      eachDayOfInterval({ start: dailyChartStart, end: dailyChartEnd }).map((day) => {
        const key = toDateKey(day);
        return {
          date: format(day, "d MMM", { locale: ru }),
          minutes: dailyMinutesByDate[key] ?? 0,
        };
      }),
    [dailyChartStart, dailyChartEnd, dailyMinutesByDate],
  );

  return (
    <div className="grid gap-5">
      <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Card title={format(anchor, "LLLL yyyy", { locale: ru })} eyebrow="Календарь фокуса">
          <div className="mb-3 flex gap-2">
            <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--primary)]" onClick={() => setAnchor(addDays(startOfMonth(anchor), -1))}>
              Предыдущий месяц
            </button>
            <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--primary)]" onClick={() => setAnchor(addDays(endOfMonth(anchor), 1))}>
              Следующий месяц
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthDays(anchor).map((day) => {
              const key = toDateKey(day);
              const minutes = totalMinutes(daySessions(sessions, key));
              const active = selectedDate === key;
              return (
                <button
                  key={key}
                  className={`min-h-20 rounded-lg border p-2 text-left transition ${active ? "border-[var(--primary)] bg-[var(--primary)]/15" : "border-[var(--border)] hover:border-[var(--primary)]/60"} ${isSameMonth(day, anchor) ? "" : "opacity-40"}`}
                  onClick={() => setSelectedDate(key)}
                >
                  <span className="font-semibold">{format(day, "d")}</span>
                  <div className="mt-3 h-1.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, (minutes / 180) * 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">{minutesToHuman(minutes)}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title={format(parseISO(selectedDate), "d MMMM yyyy", { locale: ru })} eyebrow="Выбранный день">
          <p className="text-3xl font-bold">{minutesToHuman(selectedMinutes)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{selectedSessions.length} сессий</p>
          <div className="mt-4 grid gap-2">
            {selectedTasks.map((task) => (
              <div key={task.title} className="flex justify-between gap-3 rounded-lg border border-[var(--border)] p-3 text-sm">
                <span>{task.title}</span>
                <span className="font-semibold text-[var(--primary)]">{minutesToHuman(task.minutes)}</span>
              </div>
            ))}
            {selectedTasks.length === 0 && <p className="text-sm text-[var(--muted)]">В этот день фокуса не было.</p>}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card title="День">
          <p className="text-3xl font-bold">{minutesToHuman(selectedMinutes)}</p>
        </Card>
        <Card title="Неделя">
          <p className="text-3xl font-bold">{minutesToHuman(week.minutes)}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Среднее: {weekAverageMinutes} мин. / {weekAveragePomodoros.toFixed(1)} пом.
          </p>
        </Card>
        <Card title="Месяц">
          <p className="text-3xl font-bold">{minutesToHuman(month.minutes)}</p>
        </Card>
      </section>

      <Card
        title="Фокус по дням"
        eyebrow="14 дней"
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--primary)]"
              onClick={() => setDailyChartOffset((offset) => offset + 1)}
            >
              Раньше
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={dailyChartOffset === 0}
              onClick={() => setDailyChartOffset((offset) => Math.max(0, offset - 1))}
            >
              Позже
            </button>
          </div>
        }
      >
        <p className="mb-3 text-sm text-[var(--muted)]">
          {dailyChartLabel}. Шкала: максимум {minutesToHuman(allTimeDailyMaxMinutes)} за день.
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChart}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} domain={[0, allTimeDailyMaxMinutes]} />
              <Tooltip contentStyle={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="minutes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <FocusJournal />
    </div>
  );
}
