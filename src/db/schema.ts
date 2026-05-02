export const ARSONIST_DB_NAME = "arsonist_v2";
export const ARSONIST_DB_VERSION = 1;

export const ARSONIST_STORES = [
  "tasks",
  "projects",
  "tags",
  "sessions",
  "settings",
  "stats",
  "streak",
] as const;

export type ArsonistStoreName = (typeof ARSONIST_STORES)[number];

export const ARSONIST_STORE_LABELS: Record<ArsonistStoreName, string> = {
  tasks: "Tasks",
  projects: "Projects",
  tags: "Tags",
  sessions: "Focus history",
  settings: "Settings",
  stats: "Daily statistics",
  streak: "Streak",
};
