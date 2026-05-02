import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import type { DailyStats, FocusSession, Project, Streak, Task } from "../types/models";
import { toDateKey } from "./date";
import { minutesToHuman } from "./formatting";

function projectName(projects: Project[], projectId?: string) {
  return projects.find((project) => project.id === projectId)?.name ?? "Inbox";
}

export function exportDailyLogMarkdown(input: {
  date: string;
  tasks: Task[];
  sessions: FocusSession[];
  projects: Project[];
  stats?: DailyStats;
  streak: Streak;
  frontmatter: boolean;
}) {
  const completedTasks = input.tasks.filter((task) => task.completedAt && toDateKey(task.completedAt) === input.date);
  const daySessions = input.sessions.filter((session) => toDateKey(session.startedAt) === input.date);
  const focusMinutes = daySessions.reduce((sum, session) => sum + session.actualDurationMinutes, 0);
  const lines: string[] = [];

  if (input.frontmatter) {
    lines.push("---");
    lines.push("app: Arsonist");
    lines.push(`date: ${input.date}`);
    lines.push(`focus_minutes: ${focusMinutes}`);
    lines.push(`sessions: ${daySessions.length}`);
    lines.push(`tasks_completed: ${completedTasks.length}`);
    lines.push("---");
    lines.push("");
  }

  lines.push(`# Arsonist Daily Log - ${input.date}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Focus time: ${minutesToHuman(focusMinutes)}`);
  lines.push(`- Sessions completed: ${daySessions.filter((session) => session.status === "completed").length}`);
  lines.push(`- Tasks completed: ${completedTasks.length}`);
  lines.push(`- Daily goal: ${input.stats?.dailyGoalCompleted ? "completed" : "not completed"}`);
  lines.push(`- Streak: ${input.streak.currentStreak} days`);
  lines.push("");
  lines.push("## Completed Tasks");
  lines.push("");
  lines.push(...(completedTasks.length ? completedTasks.map((task) => `- ${task.title}`) : ["- No completed tasks."]));
  lines.push("");
  lines.push("## Focus Sessions");
  lines.push("");
  lines.push("| Time | Task | Project | Duration |");
  lines.push("|---|---|---|---|");
  daySessions.forEach((session) => {
    const task = input.tasks.find((item) => item.id === session.taskId);
    lines.push(
      `| ${format(parseISO(session.startedAt), "HH:mm")} | ${task?.title ?? "Untitled focus"} | ${projectName(input.projects, session.projectId)} | ${minutesToHuman(session.actualDurationMinutes)} |`,
    );
  });
  lines.push("");
  lines.push("## Reflection");
  lines.push("");
  lines.push("Today strongest focus block was worth noticing.");

  return lines.join("\n");
}

export function exportWeeklyReportMarkdown(input: {
  anchorDate: Date;
  tasks: Task[];
  sessions: FocusSession[];
  projects: Project[];
  frontmatter: boolean;
}) {
  const start = startOfWeek(input.anchorDate, { weekStartsOn: 1 });
  const end = endOfWeek(input.anchorDate, { weekStartsOn: 1 });
  const weekSessions = input.sessions.filter((session) => {
    const date = parseISO(session.startedAt);
    return date >= start && date <= end;
  });
  const focusMinutes = weekSessions.reduce((sum, session) => sum + session.actualDurationMinutes, 0);
  const completedTasks = input.tasks.filter((task) => task.completedAt && parseISO(task.completedAt) >= start && parseISO(task.completedAt) <= end);
  const projectRows = input.projects
    .map((project) => ({
      project,
      minutes: weekSessions
        .filter((session) => session.projectId === project.id)
        .reduce((sum, session) => sum + session.actualDurationMinutes, 0),
    }))
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const lines: string[] = [];
  if (input.frontmatter) {
    lines.push("---");
    lines.push("app: Arsonist");
    lines.push(`week_start: ${format(start, "yyyy-MM-dd")}`);
    lines.push(`week_end: ${format(end, "yyyy-MM-dd")}`);
    lines.push(`focus_minutes: ${focusMinutes}`);
    lines.push("---");
    lines.push("");
  }

  lines.push("# Arsonist Weekly Report");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total focus: ${minutesToHuman(focusMinutes)}`);
  lines.push(`- Sessions: ${weekSessions.length}`);
  lines.push(`- Tasks completed: ${completedTasks.length}`);
  lines.push(`- Top project: ${projectRows[0]?.project.name ?? "No project data"}`);
  lines.push("");
  lines.push("## Project Breakdown");
  lines.push("");
  lines.push("| Project | Focus Time |");
  lines.push("|---|---|");
  projectRows.forEach((row) => lines.push(`| ${row.project.name} | ${minutesToHuman(row.minutes)} |`));

  return lines.join("\n");
}

export function exportFocusHistoryCsv(sessions: FocusSession[], tasks: Task[], projects: Project[]) {
  const lines = ["date,time,task,project,mode,status,duration_minutes"];
  sessions.forEach((session) => {
    const started = parseISO(session.startedAt);
    const task = tasks.find((item) => item.id === session.taskId);
    lines.push(
      [
        format(started, "yyyy-MM-dd"),
        format(started, "HH:mm"),
        JSON.stringify(task?.title ?? ""),
        JSON.stringify(projectName(projects, session.projectId)),
        session.mode,
        session.status,
        session.actualDurationMinutes,
      ].join(","),
    );
  });
  return lines.join("\n");
}
