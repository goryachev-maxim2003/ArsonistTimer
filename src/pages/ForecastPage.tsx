import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarClock, Check, Folder, Target, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAppStore } from "../store/appStore";
import { toDateKey } from "../utils/date";
import { minutesToHuman } from "../utils/formatting";
import type { Task } from "../types/models";

const UNASSIGNED_SCOPE = "__unassigned";
const FORECAST_SCOPE_STORAGE_KEY = "arsonist_forecast_scopes";

function loadForecastScopes() {
  try {
    const raw = localStorage.getItem(FORECAST_SCOPE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function clampWorkDays(days?: number) {
  return Math.min(7, Math.max(1, Math.round(days ?? 5)));
}

function finishDate(calendarDays: number) {
  if (!Number.isFinite(calendarDays) || calendarDays <= 0) return "сегодня";
  return format(addDays(new Date(), Math.max(0, calendarDays - 1)), "d MMMM yyyy", { locale: ru });
}

function scenario(remainingMinutes: number, activeDayMinutes: number, workDaysPerWeek: number) {
  if (remainingMinutes <= 0) return { activeDays: 0, calendarDays: 0, date: "все задачи уже закрыты" };
  if (activeDayMinutes <= 0) return { activeDays: Number.POSITIVE_INFINITY, calendarDays: Number.POSITIVE_INFINITY, date: "нужны данные" };
  const activeDays = Math.ceil(remainingMinutes / activeDayMinutes);
  const calendarDays = activeDays + Math.floor((activeDays - 1) / workDaysPerWeek) * (7 - workDaysPerWeek);
  return { activeDays, calendarDays, date: finishDate(calendarDays) };
}

function scopeIdForTask(task: Task) {
  return task.projectId && task.projectId !== "project_inbox" ? task.projectId : UNASSIGNED_SCOPE;
}

export function ForecastPage() {
  const [selectedScopes, setSelectedScopes] = useState<string[]>(() => loadForecastScopes());
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const sessions = useAppStore((state) => state.sessions);
  const settings = useAppStore((state) => state.settings);
  const focusMinutes = settings.timer.focusMinutes;
  const workDaysPerWeek = clampWorkDays(settings.dailyGoal.workDaysPerWeek);
  const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "archived");
  const activeProjects = projects.filter((project) => !project.archived && project.id !== "project_inbox");
  const unassignedCount = openTasks.filter((task) => scopeIdForTask(task) === UNASSIGNED_SCOPE).length;
  const scopeOptions = [
    ...(unassignedCount > 0 ? [{ id: UNASSIGNED_SCOPE, name: "Без проекта", count: unassignedCount }] : []),
    ...activeProjects.map((project) => ({
      id: project.id,
      name: project.name,
      count: openTasks.filter((task) => task.projectId === project.id).length,
    })),
  ];
  const availableScopeIds = new Set(scopeOptions.map((scope) => scope.id));
  const validSelectedScopes = selectedScopes.filter((id) => availableScopeIds.has(id));
  const selectedSet = new Set(validSelectedScopes);
  const allScopesSelected = validSelectedScopes.length === 0;
  const filteredOpenTasks = allScopesSelected ? openTasks : openTasks.filter((task) => selectedSet.has(scopeIdForTask(task)));
  const remainingPomodoros = filteredOpenTasks.reduce((sum, task) => sum + Math.max(0, task.estimatedPomodoros - task.completedPomodoros), 0);
  const remainingMinutes = remainingPomodoros * focusMinutes;
  const todayKey = toDateKey(new Date());
  const todayMinutes = sessions
    .filter((session) => session.mode === "focus" && session.status !== "cancelled" && toDateKey(session.startedAt) === todayKey)
    .reduce((sum, session) => sum + session.actualDurationMinutes, 0);
  const weekStart = addDays(new Date(), -6);
  const weekMinutes = sessions
    .filter((session) => session.mode === "focus" && session.status !== "cancelled" && new Date(session.startedAt) >= weekStart)
    .reduce((sum, session) => sum + session.actualDurationMinutes, 0);
  const planMinutes = settings.dailyGoal.target * focusMinutes;
  const weekAverageMinutes = Math.round(weekMinutes / workDaysPerWeek);
  const plan = scenario(remainingMinutes, planMinutes, workDaysPerWeek);
  const week = scenario(remainingMinutes, weekAverageMinutes, workDaysPerWeek);
  const today = scenario(remainingMinutes, todayMinutes, workDaysPerWeek);
  const selectedLabel = allScopesSelected
    ? "Все проекты"
    : scopeOptions.filter((scope) => selectedSet.has(scope.id)).map((scope) => scope.name).join(", ") || "Все проекты";

  const toggleScope = (id: string) => {
    setSelectedScopes((state) => {
      const base = state.filter((item) => availableScopeIds.has(item));
      if (base.includes(id)) return base.filter((item) => item !== id);
      return [...base, id];
    });
  };

  useEffect(() => {
    if (validSelectedScopes.length !== selectedScopes.length) {
      setSelectedScopes(validSelectedScopes);
      return;
    }
    localStorage.setItem(FORECAST_SCOPE_STORAGE_KEY, JSON.stringify(selectedScopes));
  }, [selectedScopes, validSelectedScopes]);

  const rows = [
    {
      title: "По дневному плану",
      icon: Target,
      detail: `${settings.dailyGoal.target} помидоров в рабочий день, ${workDaysPerWeek} дн./нед.`,
      minutes: planMinutes,
      result: plan,
    },
    {
      title: "По среднему за неделю",
      icon: TrendingUp,
      detail: `среднее ${minutesToHuman(weekAverageMinutes)} за рабочий день`,
      minutes: weekAverageMinutes,
      result: week,
    },
    {
      title: "Как сегодня",
      icon: CalendarClock,
      detail: `если в рабочий день делать ${minutesToHuman(todayMinutes)}, ${workDaysPerWeek} дн./нед.`,
      minutes: todayMinutes,
      result: today,
    },
  ];

  return (
    <div className="grid gap-5">
      <Card title="Прогноз выполнения" eyebrow="Оставшееся время">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-[var(--muted)]">Открытых задач</p>
            <p className="mt-1 text-3xl font-bold">{filteredOpenTasks.length}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Осталось помидоров</p>
            <p className="mt-1 text-3xl font-bold">{remainingPomodoros}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Осталось времени</p>
            <p className="mt-1 text-3xl font-bold">{minutesToHuman(remainingMinutes)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">Расчет: {selectedLabel}</p>
      </Card>

      {scopeOptions.length > 0 && (
        <Card title="Проекты в расчете" eyebrow="Фильтр">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                allScopesSelected ? "border-[var(--primary)] bg-[var(--primary)] text-black" : "border-[var(--border)] bg-[var(--raised)] text-[var(--text)] hover:border-[var(--primary)]"
              }`}
              onClick={() => setSelectedScopes([])}
            >
              {allScopesSelected && <Check className="h-4 w-4" />}
              Все проекты
            </button>
            {scopeOptions.map((scope) => {
              const selected = !allScopesSelected && selectedSet.has(scope.id);
              return (
                <button
                  key={scope.id}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    selected ? "border-[var(--primary)] bg-[var(--primary)] text-black" : "border-[var(--border)] bg-[var(--raised)] text-[var(--text)] hover:border-[var(--primary)]"
                  }`}
                  onClick={() => toggleScope(scope.id)}
                >
                  {selected ? <Check className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                  <span>{scope.name}</span>
                  <span className={selected ? "text-black/70" : "text-[var(--muted)]"}>{scope.count}</span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Card key={row.title} title={row.title} action={<Icon className="h-5 w-5 text-[var(--primary)]" />}>
              <p className="text-sm text-[var(--muted)]">{row.detail}</p>
              <p className="mt-4 text-3xl font-bold">{Number.isFinite(row.result.calendarDays) ? `${row.result.calendarDays} календ. дн.` : "нет прогноза"}</p>
              {Number.isFinite(row.result.activeDays) && <p className="mt-1 text-sm text-[var(--muted)]">{row.result.activeDays} рабочих дн.</p>}
              <p className="mt-2 text-sm text-[var(--muted)]">Дата завершения: {row.result.date}</p>
            </Card>
          );
        })}
      </div>

      <Card title="Что учитывается" eyebrow="Формула">
        <p className="text-sm text-[var(--muted)]">
          Прогноз считает оставшиеся помидоры по незавершенным задачам: план минус уже выполненные помидоры. Затем делит оставшееся время на работу за один рабочий день и переводит результат в календарные дни с учетом выбранного количества рабочих дней в неделю.
        </p>
      </Card>
    </div>
  );
}
