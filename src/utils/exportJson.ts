import type { ArsonistExport, DailyStats, FocusSession, Project, Streak, Tag, Task, UserSettings } from "../types/models";

export function createJsonExport(payload: {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  sessions: FocusSession[];
  settings: UserSettings;
  streak: Streak;
  stats: DailyStats[];
}): ArsonistExport {
  return {
    app: "Arsonist",
    version: "2.0.0",
    exportedAt: new Date().toISOString(),
    ...payload,
  };
}
