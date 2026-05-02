import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import type { DailyStats, FocusSession, Project, Streak, Task, UserSettings } from "../types/models";
import { DATE_KEY, todayKey, toDateKey } from "./date";
import { minutesToHuman } from "./formatting";

export function emptyDailyStats(date: string): DailyStats {
  return {
    date,
    totalFocusMinutes: 0,
    completedSessions: 0,
    partialSessions: 0,
    cancelledSessions: 0,
    completedTasks: 0,
    createdTasks: 0,
    projectBreakdown: {},
    tagBreakdown: {},
    dailyGoalCompleted: false,
  };
}

export function dailyGoalMet(stats: DailyStats, settings: UserSettings) {
  const target = Math.max(1, settings.dailyGoal.target);
  if (settings.dailyGoal.type === "focus_minutes") return stats.totalFocusMinutes >= target;
  if (settings.dailyGoal.type === "completed_tasks") return stats.completedTasks >= target;
  return stats.completedSessions >= target;
}

export function buildStreak(previous: Streak, completedDate: string): Streak {
  if (previous.lastCompletedDate === completedDate) return previous;
  const previousDate = previous.lastCompletedDate ? parseISO(previous.lastCompletedDate) : undefined;
  const currentDate = parseISO(completedDate);
  const isNextDay = previousDate
    ? Math.round((currentDate.getTime() - previousDate.getTime()) / 86_400_000) === 1
    : false;
  const currentStreak = isNextDay ? previous.currentStreak + 1 : 1;

  return {
    ...previous,
    currentStreak,
    longestStreak: Math.max(previous.longestStreak, currentStreak),
    lastCompletedDate: completedDate,
  };
}

export function summarizeStats(stats: DailyStats[], tasks: Task[], sessions: FocusSession[], projects: Project[]) {
  const today = stats.find((item) => item.date === todayKey()) ?? emptyDailyStats(todayKey());
  const lastSevenKeys = new Set(
    eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day) => format(day, DATE_KEY)),
  );
  const weekStats = stats.filter((item) => lastSevenKeys.has(item.date));
  const weekMinutes = weekStats.reduce((sum, item) => sum + item.totalFocusMinutes, 0);
  const monthKey = format(new Date(), "yyyy-MM");
  const monthStats = stats.filter((item) => item.date.startsWith(monthKey));
  const monthMinutes = monthStats.reduce((sum, item) => sum + item.totalFocusMinutes, 0);
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const activeTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "archived").length;
  const completedSessions = sessions.filter((session) => session.status === "completed" && session.mode === "focus");
  const longestSession = sessions.reduce((max, session) => Math.max(max, session.actualDurationMinutes), 0);
  const bestDay = [...stats].sort((a, b) => b.totalFocusMinutes - a.totalFocusMinutes)[0];
  const projectTotals = projects.map((project) => {
    const minutes = stats.reduce((sum, item) => sum + (item.projectBreakdown[project.id] ?? 0), 0);
    return { project, minutes };
  });
  const mostActiveProject = projectTotals.sort((a, b) => b.minutes - a.minutes)[0];

  return {
    today,
    weekMinutes,
    monthMinutes,
    completedTasks,
    activeTasks,
    completedSessions: completedSessions.length,
    averageFocusPerDay: stats.length ? Math.round(stats.reduce((sum, item) => sum + item.totalFocusMinutes, 0) / stats.length) : 0,
    longestSession,
    bestDayLabel: bestDay ? `${bestDay.date} (${minutesToHuman(bestDay.totalFocusMinutes)})` : "No data",
    mostActiveProject,
    completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
  };
}

export function sessionsByDay(sessions: FocusSession[], days = 14) {
  const keys = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map((day) => format(day, DATE_KEY));
  return keys.map((date) => {
    const minutes = sessions
      .filter((session) => session.mode === "focus" && session.status !== "cancelled" && toDateKey(session.startedAt) === date)
      .reduce((sum, session) => sum + session.actualDurationMinutes, 0);
    return { date: format(parseISO(date), "MMM d"), minutes };
  });
}

export function projectBreakdown(stats: DailyStats[], projects: Project[]) {
  return projects
    .map((project) => ({
      name: project.name,
      value: stats.reduce((sum, item) => sum + (item.projectBreakdown[project.id] ?? 0), 0),
      fill: project.color,
    }))
    .filter((item) => item.value > 0);
}
