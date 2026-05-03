export type AppRoute =
  | "dashboard"
  | "tasks"
  | "focus"
  | "projects"
  | "calendar"
  | "stats"
  | "history"
  | "guide"
  | "forecast"
  | "updates"
  | "settings";

export type TaskStatus = "todo" | "in_progress" | "completed" | "archived";
export type Priority = "low" | "medium" | "high" | "urgent";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "custom";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  projectId?: string;
  tagIds: string[];
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  scheduledDate?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  estimatedMinutes?: number;
  actualFocusMinutes: number;
  subtasks: Subtask[];
  recurrence?: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export type TimerMode = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface TimerRuntimeState {
  mode: TimerMode;
  status: TimerStatus;
  selectedTaskId?: string;
  selectedProjectId?: string;
  durationSeconds: number;
  remainingSeconds: number;
  startedAt?: string;
  pausedAt?: string;
  plannedEndAt?: string;
  totalPausedSeconds: number;
  completedFocusSessionsInCycle: number;
}

export type FocusSessionStatus = "completed" | "cancelled" | "partial";

export interface FocusSession {
  id: string;
  taskId?: string;
  projectId?: string;
  mode: TimerMode;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  status: FocusSessionStatus;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  totalFocusMinutes: number;
  completedSessions: number;
  partialSessions: number;
  cancelledSessions: number;
  completedTasks: number;
  createdTasks: number;
  projectBreakdown: Record<string, number>;
  tagBreakdown: Record<string, number>;
  dailyGoalCompleted: boolean;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  frozenDates?: string[];
}

export type ThemeName =
  | "dark-ember"
  | "charcoal"
  | "midnight"
  | "ash-light"
  | "forest-focus"
  | "deep-ocean";

export type BrandTone = "neutral" | "arsonist";
export type DailyGoalType = "focus_minutes" | "pomodoro_count" | "completed_tasks";
export type Language = "en" | "ru";
export type SoundMelody =
  | "ember_chime"
  | "digital_bell"
  | "arcade_spark"
  | "calm_gong"
  | "soft_pulse"
  | "timer_bell"
  | "warm_fire"
  | "quiet_alarm";

export interface UserSettings {
  language: Language;
  timer: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartNextFocus: boolean;
    allowManualCompletion: boolean;
    savePartialSessions: boolean;
    showTimerInTitle: boolean;
  };
  appearance: {
    theme: ThemeName;
    accentColor: string;
    compactMode: boolean;
    reducedMotion: boolean;
    brandTone: BrandTone;
  };
  dailyGoal: {
    type: DailyGoalType;
    target: number;
    workDaysPerWeek: number;
    graceMode: boolean;
  };
  notifications: {
    enabled: boolean;
    focusEnds: boolean;
    breakEnds: boolean;
    dailyGoalCompleted: boolean;
    dueSoon: boolean;
    overdue: boolean;
    streakRisk: boolean;
  };
  sounds: {
    enabled: boolean;
    volume: number;
    burnVolume: number;
    melody: SoundMelody;
    timerComplete: boolean;
    focusComplete: boolean;
    breakComplete: boolean;
    taskComplete: boolean;
    dailyGoal: boolean;
    streak: boolean;
  };
  ai: {
    enabled: boolean;
    provider: "disabled" | "openai-compatible" | "ollama" | "llama.cpp" | "lm-studio" | "custom";
    baseUrl: string;
    model: string;
    apiKey?: string;
  };
  export: {
    obsidianFrontmatter: boolean;
  };
}

export interface ArsonistExport {
  app: "Arsonist";
  version: "2.0.0";
  exportedAt: string;
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  sessions: FocusSession[];
  settings: UserSettings;
  streak: Streak;
  stats: DailyStats[];
}

export interface TaskDraft {
  title: string;
  description?: string;
  notes?: string;
  projectId?: string;
  tagIds?: string[];
  priority?: Priority;
  dueDate?: string;
  scheduledDate?: string;
  estimatedPomodoros?: number;
  estimatedMinutes?: number;
  subtasks?: Subtask[];
  recurrence?: RecurrenceRule;
}

export interface ProjectDraft {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}
