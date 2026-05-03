import { create } from "zustand";
import { addDays, differenceInSeconds, parseISO } from "date-fns";
import {
  deleteRecord,
  getDatabaseInfo,
  loadAllData,
  loadTimerRuntime,
  putRecord,
  resetAllData,
  saveSettings,
  saveStreak,
  saveTimerRuntime,
} from "../db/indexedDb";
import type { ArsonistStoreName } from "../db/schema";
import type {
  AppRoute,
  ArsonistExport,
  DailyStats,
  FocusSession,
  FocusSessionStatus,
  Priority,
  Project,
  ProjectDraft,
  RecurrenceRule,
  Streak,
  Subtask,
  Tag,
  Task,
  TaskDraft,
  TimerMode,
  TimerRuntimeState,
  UserSettings,
} from "../types/models";
import { createJsonExport } from "../utils/exportJson";
import { createNextRecurringTask } from "../utils/recurrence";
import { createId } from "../utils/ids";
import { nowIso, todayKey, toDateKey } from "../utils/date";
import { buildStreak, dailyGoalMet, emptyDailyStats } from "../utils/stats";
import { parseQuickAdd } from "../utils/quickAdd";

export const defaultSettings: UserSettings = {
  language: "ru",
  timer: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartNextFocus: false,
    allowManualCompletion: true,
    savePartialSessions: true,
    showTimerInTitle: true,
  },
  appearance: {
    theme: "dark-ember",
    accentColor: "#FF6A00",
    compactMode: false,
    reducedMotion: false,
    brandTone: "arsonist",
  },
  dailyGoal: {
    type: "pomodoro_count",
    target: 1,
    workDaysPerWeek: 5,
    graceMode: true,
  },
  notifications: {
    enabled: false,
    focusEnds: true,
    breakEnds: true,
    dailyGoalCompleted: true,
    dueSoon: true,
    overdue: true,
    streakRisk: true,
  },
  sounds: {
    enabled: true,
    volume: 70,
    burnVolume: 55,
    melody: "ember_chime",
    timerComplete: true,
    focusComplete: true,
    breakComplete: true,
    taskComplete: true,
    dailyGoal: true,
    streak: true,
  },
  ai: {
    enabled: false,
    provider: "disabled",
    baseUrl: "http://127.0.0.1:8080/v1",
    model: "local-model",
    apiKey: "",
  },
  export: {
    obsidianFrontmatter: true,
  },
};

export const defaultStreak: Streak = {
  currentStreak: 0,
  longestStreak: 0,
  frozenDates: [],
};

function initialRoute(): AppRoute {
  const saved = localStorage.getItem("arsonist_last_route");
  return saved === "stats" || saved === "forecast" || saved === "updates" || saved === "settings" ? saved : "tasks";
}

const defaultProjects: Project[] = [
  {
    id: "project_inbox",
    name: "Inbox",
    description: "Default project for quick captures.",
    color: "#FF6A00",
    icon: "Sparkles",
    archived: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

function defaultTimer(settings = defaultSettings): TimerRuntimeState {
  return {
    mode: "focus",
    status: "idle",
    durationSeconds: settings.timer.focusMinutes * 60,
    remainingSeconds: settings.timer.focusMinutes * 60,
    totalPausedSeconds: 0,
    completedFocusSessionsInCycle: 0,
  };
}

function mergeSettings(settings?: Partial<UserSettings>): UserSettings {
  return {
    ...defaultSettings,
    ...settings,
    language: "ru",
    timer: { ...defaultSettings.timer, ...settings?.timer },
    appearance: { ...defaultSettings.appearance, ...settings?.appearance },
    dailyGoal: { ...defaultSettings.dailyGoal, ...settings?.dailyGoal },
    notifications: { ...defaultSettings.notifications, ...settings?.notifications },
    sounds: { ...defaultSettings.sounds, ...settings?.sounds },
    ai: { ...defaultSettings.ai, ...settings?.ai },
    export: { ...defaultSettings.export, ...settings?.export },
  };
}

function timerDuration(settings: UserSettings, mode: TimerMode) {
  if (mode === "short_break") return settings.timer.shortBreakMinutes * 60;
  if (mode === "long_break") return settings.timer.longBreakMinutes * 60;
  return settings.timer.focusMinutes * 60;
}

function updateDailyStatsList(stats: DailyStats[], date: string, updater: (item: DailyStats) => DailyStats) {
  const current = stats.find((item) => item.date === date) ?? emptyDailyStats(date);
  const updated = updater({ ...current, projectBreakdown: { ...current.projectBreakdown }, tagBreakdown: { ...current.tagBreakdown } });
  return [...stats.filter((item) => item.date !== date), updated].sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeTaskDraft(draft: TaskDraft): Task | undefined {
  const title = draft.title.trim();
  if (!title) return undefined;
  const createdAt = nowIso();
  return {
    id: createId("task"),
    title,
    description: draft.description?.trim() || undefined,
    notes: draft.notes?.trim() || undefined,
    projectId: draft.projectId,
    tagIds: draft.tagIds ?? [],
    status: "todo",
    priority: draft.priority ?? "medium",
    dueDate: draft.dueDate || undefined,
    scheduledDate: draft.scheduledDate || draft.dueDate || undefined,
    estimatedPomodoros: Math.max(0, draft.estimatedPomodoros ?? 1),
    completedPomodoros: 0,
    estimatedMinutes: draft.estimatedMinutes,
    actualFocusMinutes: 0,
    subtasks: draft.subtasks ?? [],
    recurrence: draft.recurrence,
    createdAt,
    updatedAt: createdAt,
  };
}

function safeNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(title, { body });
}

function notifyDesktopTimerComplete(mode: TimerMode) {
  window.arsonistDesktop?.notifyTimerComplete?.({
    title: mode === "focus" ? "Фокус завершен" : "Перерыв закончился",
    body: mode === "focus" ? "Можно запустить перерыв или сразу продолжить работу." : "Можно вернуться к задаче.",
  });
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume / 100));
}

function createAudioContext() {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AudioContextCtor ? new AudioContextCtor() : undefined;
}

function playTaskBurnSound(enabled: boolean, volume = 55) {
  if (!enabled) return;
  const audio = new Audio(new URL("sounds/task-burn.ogg", window.location.href).toString());
  audio.volume = clampVolume(volume);
  audio.currentTime = 0;
  const playback = audio.play();
  if (playback) void playback.catch(() => undefined);
}

function playSyntheticTaskBurnSound(enabled: boolean, volume = 55) {
  if (!enabled) return;
  const context = createAudioContext();
  if (!context) return;
  const level = clampVolume(volume);
  const master = context.createGain();
  const now = context.currentTime;
  const noiseDuration = 1.05;
  const sampleCount = Math.floor(context.sampleRate * noiseDuration);
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const output = buffer.getChannelData(0);
  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleCount;
    const attack = Math.min(1, t / 0.08);
    const decay = Math.max(0, 1 - t);
    const crackleGate = Math.random() > 0.72 ? 1 : 0.18;
    output[index] = (Math.random() * 2 - 1) * attack * decay * crackleGate;
  }

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.35 * level, now + 0.05);
  master.gain.exponentialRampToValueAtTime(0.001, now + 1.08);
  master.connect(context.destination);

  const whoosh = context.createBufferSource();
  const whooshFilter = context.createBiquadFilter();
  const whooshGain = context.createGain();
  whoosh.buffer = buffer;
  whooshFilter.type = "bandpass";
  whooshFilter.frequency.setValueAtTime(380, now);
  whooshFilter.frequency.exponentialRampToValueAtTime(1450, now + 0.42);
  whooshFilter.Q.value = 0.65;
  whooshGain.gain.setValueAtTime(0.001, now);
  whooshGain.gain.exponentialRampToValueAtTime(0.62, now + 0.06);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
  whoosh.connect(whooshFilter);
  whooshFilter.connect(whooshGain);
  whooshGain.connect(master);
  whoosh.start(now);
  whoosh.stop(now + noiseDuration);

  const crackle = context.createBufferSource();
  const crackleFilter = context.createBiquadFilter();
  const crackleGain = context.createGain();
  crackle.buffer = buffer;
  crackleFilter.type = "highpass";
  crackleFilter.frequency.value = 1850;
  crackleGain.gain.setValueAtTime(0.001, now);
  crackleGain.gain.exponentialRampToValueAtTime(0.5, now + 0.12);
  crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.02);
  crackle.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(master);
  crackle.start(now + 0.03);
  crackle.stop(now + noiseDuration);

  [0.11, 0.2, 0.34, 0.53, 0.74].forEach((offset, index) => {
    const pop = context.createOscillator();
    const popGain = context.createGain();
    pop.type = index % 2 === 0 ? "square" : "triangle";
    pop.frequency.setValueAtTime(900 + Math.random() * 900, now + offset);
    popGain.gain.setValueAtTime(0.0001, now + offset);
    popGain.gain.exponentialRampToValueAtTime((0.035 + Math.random() * 0.04) * level, now + offset + 0.006);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.06 + Math.random() * 0.06);
    pop.connect(popGain);
    popGain.connect(context.destination);
    pop.start(now + offset);
    pop.stop(now + offset + 0.14);
  });

  const oscillator = context.createOscillator();
  const ember = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(82, now);
  oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.95);
  ember.gain.setValueAtTime(0.001, now);
  ember.gain.exponentialRampToValueAtTime(0.055 * level, now + 0.08);
  ember.gain.exponentialRampToValueAtTime(0.001, now + 1);
  oscillator.connect(ember);
  ember.connect(context.destination);
  oscillator.start(now + 0.02);
  oscillator.stop(now + 1.05);
}

type TimerNote = {
  frequency: number;
  offset: number;
  duration: number;
  type?: OscillatorType;
};

const timerMelodies: Record<UserSettings["sounds"]["melody"], TimerNote[]> = {
  ember_chime: [
    { frequency: 523.25, offset: 0, duration: 0.42 },
    { frequency: 659.25, offset: 0.11, duration: 0.42 },
    { frequency: 783.99, offset: 0.22, duration: 0.5 },
  ],
  digital_bell: [
    { frequency: 880, offset: 0, duration: 0.18 },
    { frequency: 1174.66, offset: 0.2, duration: 0.18 },
    { frequency: 880, offset: 0.42, duration: 0.24 },
    { frequency: 1318.51, offset: 0.66, duration: 0.34 },
  ],
  arcade_spark: [
    { frequency: 659.25, offset: 0, duration: 0.14, type: "square" as OscillatorType },
    { frequency: 783.99, offset: 0.13, duration: 0.14, type: "square" as OscillatorType },
    { frequency: 987.77, offset: 0.26, duration: 0.18, type: "square" as OscillatorType },
    { frequency: 1318.51, offset: 0.43, duration: 0.28, type: "triangle" as OscillatorType },
  ],
  calm_gong: [
    { frequency: 196, offset: 0, duration: 1.25 },
    { frequency: 392, offset: 0.04, duration: 1.05 },
    { frequency: 587.33, offset: 0.08, duration: 0.9 },
  ],
  soft_pulse: [
    { frequency: 440, offset: 0, duration: 0.28 },
    { frequency: 554.37, offset: 0.28, duration: 0.28 },
    { frequency: 659.25, offset: 0.56, duration: 0.42 },
  ],
  timer_bell: [
    { frequency: 987.77, offset: 0, duration: 0.2 },
    { frequency: 1318.51, offset: 0.22, duration: 0.2 },
    { frequency: 987.77, offset: 0.5, duration: 0.35 },
  ],
  warm_fire: [
    { frequency: 174.61, offset: 0, duration: 0.52, type: "triangle" },
    { frequency: 220, offset: 0.12, duration: 0.5, type: "sawtooth" },
    { frequency: 329.63, offset: 0.34, duration: 0.45, type: "triangle" },
  ],
  quiet_alarm: [
    { frequency: 698.46, offset: 0, duration: 0.22 },
    { frequency: 698.46, offset: 0.34, duration: 0.22 },
    { frequency: 1046.5, offset: 0.7, duration: 0.38 },
  ],
};

function playTimerChime(enabled: boolean, volume = 70, melody: keyof typeof timerMelodies = "ember_chime") {
  if (!enabled) return;
  const context = createAudioContext();
  if (!context) return;
  const master = context.createGain();
  master.gain.value = 0.09 * clampVolume(volume);
  master.connect(context.destination);

  if (melody === "warm_fire") {
    const duration = 0.95;
    const sampleCount = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      const fade = 1 - index / sampleCount;
      output[index] = (Math.random() * 2 - 1) * fade * 0.7;
    }
    const crackle = context.createBufferSource();
    const crackleFilter = context.createBiquadFilter();
    const crackleGain = context.createGain();
    crackle.buffer = buffer;
    crackleFilter.type = "highpass";
    crackleFilter.frequency.value = 850;
    crackleGain.gain.value = 0.35;
    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(master);
    crackle.start(context.currentTime + 0.02);
    crackle.stop(context.currentTime + duration);
  }

  timerMelodies[melody].forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + note.offset;
    oscillator.type = note.type ?? "sine";
    oscillator.frequency.value = note.frequency;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(1, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + note.duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(startAt);
    oscillator.stop(startAt + note.duration + 0.02);
  });
}

interface AppState {
  hydrated: boolean;
  route: AppRoute;
  commandOpen: boolean;
  sidebarCollapsed: boolean;
  toast?: string;
  breakSuggestion?: TimerMode;
  completionPrompt?: TimerMode;
  dbInfo?: {
    name: string;
    version: number;
    stores: readonly ArsonistStoreName[];
    counts: Record<ArsonistStoreName, number>;
    usageBytes?: number;
    quotaBytes?: number;
  };
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  sessions: FocusSession[];
  stats: DailyStats[];
  streak: Streak;
  settings: UserSettings;
  timer: TimerRuntimeState;
  hydrate: () => Promise<void>;
  setRoute: (route: AppRoute) => void;
  setCommandOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setToast: (message?: string) => void;
  createTask: (draft: TaskDraft) => Promise<Task | undefined>;
  quickAddTask: (text: string, date?: string) => Promise<Task | undefined>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  createProject: (draft: ProjectDraft) => Promise<Project | undefined>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  ensureTag: (name: string) => Promise<Tag>;
  deleteSession: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  updateTimerSettings: (patch: Partial<UserSettings["timer"]>) => Promise<void>;
  updateAppearanceSettings: (patch: Partial<UserSettings["appearance"]>) => Promise<void>;
  updateDailyGoalSettings: (patch: Partial<UserSettings["dailyGoal"]>) => Promise<void>;
  updateNotificationSettings: (patch: Partial<UserSettings["notifications"]>) => Promise<void>;
  updateSoundSettings: (patch: Partial<UserSettings["sounds"]>) => Promise<void>;
  testSound: () => void;
  testTaskBurnSound: () => void;
  playTaskBurn: () => void;
  updateAiSettings: (patch: Partial<UserSettings["ai"]>) => Promise<void>;
  updateExportSettings: (patch: Partial<UserSettings["export"]>) => Promise<void>;
  requestNotifications: () => Promise<void>;
  refreshDbInfo: () => Promise<void>;
  startTimer: (mode?: TimerMode, taskId?: string) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => Promise<void>;
  completeTimer: (status?: FocusSessionStatus) => Promise<void>;
  resetTimer: (mode?: TimerMode) => void;
  skipTimer: () => void;
  tickTimer: () => void;
  selectTimerTask: (taskId?: string) => void;
  switchTimerTask: (taskId: string) => Promise<void>;
  dismissCompletionPrompt: () => void;
  exportData: () => ArsonistExport;
  importData: (payload: ArsonistExport) => Promise<void>;
  resetApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  route: initialRoute(),
  commandOpen: false,
  sidebarCollapsed: localStorage.getItem("arsonist_sidebar_collapsed") === "true",
  tasks: [],
  projects: defaultProjects,
  tags: [],
  sessions: [],
  stats: [],
  streak: defaultStreak,
  settings: defaultSettings,
  timer: defaultTimer(),

  hydrate: async () => {
    const data = await loadAllData();
    const settings = mergeSettings(data.settings);
    const loadedTimer = loadTimerRuntime<TimerRuntimeState>();
    const projects = data.projects.length ? data.projects : defaultProjects;

    projects.forEach((project) => void putRecord("projects", project));

    const timer: TimerRuntimeState =
      loadedTimer?.status === "running" && loadedTimer.plannedEndAt
        ? {
            ...loadedTimer,
            remainingSeconds: Math.max(0, differenceInSeconds(parseISO(loadedTimer.plannedEndAt), new Date())),
            status: differenceInSeconds(parseISO(loadedTimer.plannedEndAt), new Date()) <= 0 ? "completed" : loadedTimer.status,
          }
        : loadedTimer ?? defaultTimer(settings);

    set({
      hydrated: true,
      tasks: data.tasks,
      projects,
      tags: data.tags,
      sessions: data.sessions,
      settings,
      stats: data.stats,
      streak: data.streak ?? defaultStreak,
      timer,
    });
  },

  setRoute: (route) => {
    localStorage.setItem("arsonist_last_route", route);
    set({ route, commandOpen: false });
  },
  setCommandOpen: (open) => set({ commandOpen: open }),
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem("arsonist_sidebar_collapsed", String(next));
    set({ sidebarCollapsed: next });
  },
  setToast: (message) => set({ toast: message }),

  createTask: async (draft) => {
    const task = normalizeTaskDraft(draft);
    if (!task) {
      set({ toast: "Task title cannot be empty." });
      return undefined;
    }

    const date = todayKey();
    let nextStats = get().stats;
    nextStats = updateDailyStatsList(nextStats, date, (item) => ({ ...item, createdTasks: item.createdTasks + 1 }));
    set((state) => ({ tasks: [task, ...state.tasks], stats: nextStats, toast: "Task created." }));
    await Promise.all([putRecord("tasks", task), putRecord("stats", nextStats.find((item) => item.date === date)!)]);
    return task;
  },

  quickAddTask: async (text, date) => {
    const parsed = parseQuickAdd(text);
    const tagIds: string[] = [];
    for (const name of parsed.tagNames) {
      const tag = await get().ensureTag(name);
      tagIds.push(tag.id);
    }
    return get().createTask({
      title: parsed.title,
      priority: parsed.priority,
      dueDate: date ?? parsed.dueDate,
      scheduledDate: date ?? parsed.dueDate,
      estimatedPomodoros: parsed.estimatedPomodoros,
      tagIds,
      recurrence: parsed.recurrence,
    });
  },

  updateTask: async (id, patch) => {
    let updated: Task | undefined;
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;
        updated = { ...task, ...patch, updatedAt: nowIso() };
        return updated;
      }),
    }));
    if (updated) await putRecord("tasks", updated);
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id), toast: "Task deleted." }));
    await deleteRecord("tasks", id);
  },

  duplicateTask: async (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;
    const now = nowIso();
    const copy: Task = {
      ...task,
      id: createId("task"),
      title: `${task.title} copy`,
      status: "todo",
      completedPomodoros: 0,
      actualFocusMinutes: 0,
      subtasks: task.subtasks.map((subtask) => ({ ...subtask, id: createId("subtask"), completed: false, completedAt: undefined })),
      createdAt: now,
      updatedAt: now,
      completedAt: undefined,
      archivedAt: undefined,
    };
    set((state) => ({ tasks: [copy, ...state.tasks], toast: "Task duplicated." }));
    await putRecord("tasks", copy);
  },

  completeTask: async (id) => {
    const state = get();
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    const now = nowIso();
    const completedTask: Task = { ...task, status: "completed", completedAt: now, updatedAt: now };
    const nextRecurring = createNextRecurringTask(completedTask);
    const date = todayKey();
    const nextStats = updateDailyStatsList(state.stats, date, (item) => ({ ...item, completedTasks: item.completedTasks + 1 }));
    const completedDaily = nextStats.find((item) => item.date === date)!;
    const settings = state.settings;
    completedDaily.dailyGoalCompleted = dailyGoalMet(completedDaily, settings);
    const nextStreak = !state.stats.find((item) => item.date === date)?.dailyGoalCompleted && completedDaily.dailyGoalCompleted
      ? buildStreak(state.streak, date)
      : state.streak;

    const nextTasks = state.tasks.map((item) => (item.id === id ? completedTask : item));
    if (nextRecurring) nextTasks.unshift(nextRecurring);

    set({ tasks: nextTasks, stats: nextStats, streak: nextStreak, toast: nextRecurring ? "Task completed. Next recurrence created." : "Task completed." });
    await Promise.all([
      putRecord("tasks", completedTask),
      nextRecurring ? putRecord("tasks", nextRecurring) : Promise.resolve(),
      putRecord("stats", completedDaily),
      saveStreak(nextStreak),
    ]);
  },

  archiveTask: async (id) => {
    await get().updateTask(id, { status: "archived", archivedAt: nowIso() });
    set({ toast: "Task archived." });
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return;
    const subtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed, completedAt: subtask.completed ? undefined : nowIso() }
        : subtask,
    );
    await get().updateTask(taskId, { subtasks });
  },

  addSubtask: async (taskId, title) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task || !title.trim()) return;
    const subtask: Subtask = {
      id: createId("subtask"),
      title: title.trim(),
      completed: false,
      createdAt: nowIso(),
    };
    await get().updateTask(taskId, { subtasks: [...task.subtasks, subtask] });
  },

  createProject: async (draft) => {
    const name = draft.name.trim();
    if (!name) {
      set({ toast: "Project name cannot be empty." });
      return undefined;
    }
    const now = nowIso();
    const project: Project = {
      id: createId("project"),
      name,
      description: draft.description?.trim() || undefined,
      color: draft.color ?? "#FF6A00",
      icon: draft.icon,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ projects: [project, ...state.projects], toast: "Project created." }));
    await putRecord("projects", project);
    return project;
  },

  updateProject: async (id, patch) => {
    let updated: Project | undefined;
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id !== id) return project;
        updated = { ...project, ...patch, updatedAt: nowIso() };
        return updated;
      }),
    }));
    if (updated) await putRecord("projects", updated);
  },

  deleteProject: async (id) => {
    if (id === "project_inbox") {
      set({ toast: "Inbox cannot be deleted." });
      return;
    }
    const now = nowIso();
    const state = get();
    const updatedTasks = state.tasks.map((task) => (task.projectId === id ? { ...task, projectId: undefined, updatedAt: now } : task));
    const changedTasks = updatedTasks.filter((task, index) => task !== state.tasks[index]);

    set({
      projects: state.projects.filter((project) => project.id !== id),
      tasks: updatedTasks,
      toast: "Project deleted.",
    });
    await Promise.all([deleteRecord("projects", id), ...changedTasks.map((task) => putRecord("tasks", task))]);
  },

  archiveProject: async (id) => {
    await get().updateProject(id, { archived: true, archivedAt: nowIso() });
    set({ toast: "Project archived." });
  },

  ensureTag: async (name) => {
    const normalized = name.trim().toLowerCase();
    const existing = get().tags.find((tag) => tag.name.toLowerCase() === normalized);
    if (existing) return existing;
    const colors = ["#FF6A00", "#FFC857", "#3DDC84", "#5DADEC", "#B794F4", "#FF6B8A"];
    const tag: Tag = {
      id: createId("tag"),
      name: normalized,
      color: colors[get().tags.length % colors.length],
      createdAt: nowIso(),
    };
    set((state) => ({ tags: [...state.tags, tag] }));
    await putRecord("tags", tag);
    return tag;
  },

  deleteSession: async (id) => {
    set((state) => ({ sessions: state.sessions.filter((session) => session.id !== id), toast: "Session deleted." }));
    await deleteRecord("sessions", id);
  },

  updateSettings: async (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await saveSettings(settings);
  },
  updateTimerSettings: async (patch) => {
    const settings = { ...get().settings, timer: { ...get().settings.timer, ...patch } };
    set({ settings });
    await saveSettings(settings);
    if (get().timer.status === "idle") get().resetTimer(get().timer.mode);
  },
  updateAppearanceSettings: async (patch) => {
    const settings = { ...get().settings, appearance: { ...get().settings.appearance, ...patch } };
    set({ settings });
    await saveSettings(settings);
  },
  updateDailyGoalSettings: async (patch) => {
    const settings = { ...get().settings, dailyGoal: { ...get().settings.dailyGoal, ...patch } };
    set({ settings });
    await saveSettings(settings);
  },
  updateNotificationSettings: async (patch) => {
    const settings = { ...get().settings, notifications: { ...get().settings.notifications, ...patch } };
    set({ settings });
    await saveSettings(settings);
  },
  updateSoundSettings: async (patch) => {
    const settings = { ...get().settings, sounds: { ...get().settings.sounds, ...patch } };
    set({ settings });
    await saveSettings(settings);
  },
  testSound: () => {
    const sounds = get().settings.sounds;
    playTimerChime(sounds.enabled, sounds.volume, sounds.melody);
  },
  testTaskBurnSound: () => {
    const sounds = get().settings.sounds;
    playTaskBurnSound(sounds.enabled && sounds.taskComplete, sounds.burnVolume);
  },
  playTaskBurn: () => {
    const sounds = get().settings.sounds;
    playTaskBurnSound(sounds.enabled && sounds.taskComplete, sounds.burnVolume);
  },
  updateAiSettings: async (patch) => {
    const settings = { ...get().settings, ai: { ...get().settings.ai, ...patch } };
    set({ settings });
    await saveSettings(settings);
  },
  updateExportSettings: async (patch) => {
    const settings = { ...get().settings, export: { ...get().settings.export, ...patch } };
    set({ settings });
    await saveSettings(settings);
  },

  requestNotifications: async () => {
    if (typeof Notification === "undefined") {
      set({ toast: "Notifications are not supported in this browser." });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await get().updateNotificationSettings({ enabled: true });
      set({ toast: "Notifications enabled." });
      return;
    }
    set({ toast: "Notifications are blocked in your browser." });
  },

  refreshDbInfo: async () => {
    const dbInfo = await getDatabaseInfo();
    set({ dbInfo });
  },

  startTimer: async (mode = get().timer.mode, taskId = get().timer.selectedTaskId) => {
    const state = get();
    const task = taskId ? state.tasks.find((item) => item.id === taskId) : undefined;
    const durationSeconds = timerDuration(state.settings, mode);
    const startedAt = nowIso();
    const plannedEndAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
    const timer: TimerRuntimeState = {
      ...state.timer,
      mode,
      status: "running",
      selectedTaskId: taskId,
      selectedProjectId: task?.projectId,
      durationSeconds,
      remainingSeconds: durationSeconds,
      startedAt,
      plannedEndAt,
      pausedAt: undefined,
      totalPausedSeconds: 0,
    };
    set({ timer, breakSuggestion: undefined, completionPrompt: undefined });
    saveTimerRuntime(timer);
    if (task && task.status === "todo") await get().updateTask(task.id, { status: "in_progress" });
  },

  pauseTimer: () => {
    const timer = get().timer;
    if (timer.status !== "running" || !timer.plannedEndAt) return;
    const remainingSeconds = Math.max(0, differenceInSeconds(parseISO(timer.plannedEndAt), new Date()));
    const paused: TimerRuntimeState = { ...timer, status: "paused", remainingSeconds, pausedAt: nowIso() };
    set({ timer: paused });
    saveTimerRuntime(paused);
  },

  resumeTimer: () => {
    const timer = get().timer;
    if (timer.status !== "paused") return;
    const now = new Date();
    const plannedEndAt = new Date(now.getTime() + timer.remainingSeconds * 1000).toISOString();
    const pausedSeconds = timer.pausedAt ? Math.max(0, differenceInSeconds(now, parseISO(timer.pausedAt))) : 0;
    const resumed: TimerRuntimeState = {
      ...timer,
      status: "running",
      plannedEndAt,
      pausedAt: undefined,
      totalPausedSeconds: timer.totalPausedSeconds + pausedSeconds,
    };
    set({ timer: resumed });
    saveTimerRuntime(resumed);
  },

  stopTimer: async () => {
    const timer = get().timer;
    if (timer.status === "idle") return;
    get().resetTimer("focus");
    set({ toast: timer.mode === "focus" ? "Таймер прерван." : "Перерыв остановлен." });
  },

  completeTimer: async (status = "completed") => {
    const state = get();
    const timer = state.timer;
    if (!timer.startedAt) {
      get().resetTimer(timer.mode);
      return;
    }
    const endedAt = nowIso();
    const elapsedSeconds =
      status === "completed"
        ? timer.durationSeconds
        : Math.max(0, differenceInSeconds(parseISO(endedAt), parseISO(timer.startedAt)) - timer.totalPausedSeconds);
    const actualDurationMinutes = status === "cancelled" && elapsedSeconds < 60 ? 0 : Math.max(1, Math.round(elapsedSeconds / 60));
    const session: FocusSession = {
      id: createId("session"),
      taskId: timer.selectedTaskId,
      projectId: timer.selectedProjectId,
      mode: timer.mode,
      plannedDurationMinutes: Math.round(timer.durationSeconds / 60),
      actualDurationMinutes,
      status,
      startedAt: timer.startedAt,
      endedAt,
      createdAt: endedAt,
    };

    const isFocus = session.mode === "focus";
    const shouldCountMinutes = isFocus && session.status !== "cancelled";
    const task = session.taskId ? state.tasks.find((item) => item.id === session.taskId) : undefined;
    let tasks = state.tasks;
    if (task && shouldCountMinutes) {
      const updatedTask: Task = {
        ...task,
        completedPomodoros: task.completedPomodoros + (session.status === "completed" ? 1 : 0),
        actualFocusMinutes: task.actualFocusMinutes + session.actualDurationMinutes,
        updatedAt: endedAt,
      };
      tasks = tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item));
      await putRecord("tasks", updatedTask);
    }

    const date = toDateKey(session.startedAt);
    const previousDaily = state.stats.find((item) => item.date === date);
    const nextStats = updateDailyStatsList(state.stats, date, (item) => {
      if (isFocus) {
        if (session.status === "completed") item.completedSessions += 1;
        if (session.status === "partial") item.partialSessions += 1;
        if (session.status === "cancelled") item.cancelledSessions += 1;
        if (shouldCountMinutes) item.totalFocusMinutes += session.actualDurationMinutes;
        if (shouldCountMinutes && session.projectId) {
          item.projectBreakdown[session.projectId] = (item.projectBreakdown[session.projectId] ?? 0) + session.actualDurationMinutes;
        }
        if (shouldCountMinutes && task) {
          task.tagIds.forEach((tagId) => {
            item.tagBreakdown[tagId] = (item.tagBreakdown[tagId] ?? 0) + session.actualDurationMinutes;
          });
        }
      }
      item.dailyGoalCompleted = dailyGoalMet(item, state.settings);
      return item;
    });
    const daily = nextStats.find((item) => item.date === date)!;
    const nextStreak = !previousDaily?.dailyGoalCompleted && daily.dailyGoalCompleted ? buildStreak(state.streak, date) : state.streak;
    const completedCycle =
      isFocus && session.status === "completed" ? timer.completedFocusSessionsInCycle + 1 : timer.completedFocusSessionsInCycle;
    const nextBreak =
      isFocus && session.status === "completed"
        ? completedCycle >= state.settings.timer.longBreakInterval
          ? "long_break"
          : "short_break"
        : undefined;
    const shouldAutoStartBreak = Boolean(nextBreak && state.settings.timer.autoStartBreaks);
    const shouldAutoStartFocus = session.mode !== "focus" && session.status === "completed" && state.settings.timer.autoStartNextFocus;
    const resetCycle = nextBreak === "long_break" ? 0 : completedCycle;
    const nextTimer: TimerRuntimeState = {
      ...defaultTimer(state.settings),
      mode: timer.mode,
      selectedTaskId: timer.selectedTaskId,
      selectedProjectId: timer.selectedProjectId,
      completedFocusSessionsInCycle: resetCycle,
      status: "completed",
      remainingSeconds: 0,
    };

    set({
      tasks,
      sessions: [session, ...state.sessions],
      stats: nextStats,
      streak: nextStreak,
      timer: nextTimer,
      breakSuggestion: nextBreak,
      completionPrompt: session.status === "completed" && !shouldAutoStartBreak && !shouldAutoStartFocus ? session.mode : undefined,
      toast: session.status === "completed" ? "Session saved." : "Session logged.",
    });
    saveTimerRuntime(nextTimer);
    await Promise.all([putRecord("sessions", session), putRecord("stats", daily), saveStreak(nextStreak)]);

    if (session.status === "completed") {
      notifyDesktopTimerComplete(session.mode);
      if (state.settings.notifications.enabled) {
        if (session.mode === "focus" && state.settings.notifications.focusEnds) safeNotification("Фокус завершен", "Фокус-сессия сохранена.");
        if (session.mode !== "focus" && state.settings.notifications.breakEnds) safeNotification("Перерыв закончился", "Можно вернуться к задаче.");
      }
      playTimerChime(
        state.settings.sounds.enabled &&
          state.settings.sounds.timerComplete &&
          (session.mode === "focus" ? state.settings.sounds.focusComplete : state.settings.sounds.breakComplete),
        state.settings.sounds.volume,
        state.settings.sounds.melody,
      );
    }
    if (shouldAutoStartBreak && nextBreak) {
      window.setTimeout(() => void get().startTimer(nextBreak, timer.selectedTaskId), 700);
    }
    if (shouldAutoStartFocus) {
      window.setTimeout(() => void get().startTimer("focus", timer.selectedTaskId), 700);
    }
  },

  resetTimer: (mode = get().timer.mode) => {
    const durationSeconds = timerDuration(get().settings, mode);
    const timer: TimerRuntimeState = {
      ...get().timer,
      mode,
      status: "idle",
      durationSeconds,
      remainingSeconds: durationSeconds,
      startedAt: undefined,
      pausedAt: undefined,
      plannedEndAt: undefined,
      totalPausedSeconds: 0,
    };
    set({ timer, breakSuggestion: undefined, completionPrompt: undefined });
    saveTimerRuntime(timer);
  },

  skipTimer: () => {
    const mode = get().timer.mode === "focus" ? "short_break" : "focus";
    get().resetTimer(mode);
  },

  tickTimer: () => {
    const timer = get().timer;
    if (timer.status !== "running" || !timer.plannedEndAt) return;
    const remainingSeconds = Math.max(0, differenceInSeconds(parseISO(timer.plannedEndAt), new Date()));
    if (remainingSeconds <= 0) {
      set({ timer: { ...timer, remainingSeconds: 0, status: "completed" } });
      void get().completeTimer("completed");
      return;
    }
    const next = { ...timer, remainingSeconds };
    set({ timer: next });
    saveTimerRuntime(next);
  },

  selectTimerTask: (taskId) => {
    const task = taskId ? get().tasks.find((item) => item.id === taskId) : undefined;
    const timer = { ...get().timer, selectedTaskId: taskId, selectedProjectId: task?.projectId };
    set({ timer });
    saveTimerRuntime(timer);
  },

  switchTimerTask: async (taskId) => {
    const state = get();
    const timer = state.timer;
    if (timer.selectedTaskId === taskId) return;
    const nextTask = state.tasks.find((task) => task.id === taskId);
    if (!nextTask) return;

    if (timer.status !== "running" || timer.mode !== "focus" || !timer.startedAt || !timer.selectedTaskId) {
      get().selectTimerTask(taskId);
      return;
    }

    const endedAt = nowIso();
    const elapsedSeconds = Math.max(0, differenceInSeconds(parseISO(endedAt), parseISO(timer.startedAt)) - timer.totalPausedSeconds);
    const actualDurationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const currentTask = state.tasks.find((task) => task.id === timer.selectedTaskId);
    let tasks = state.tasks;
    let sessions = state.sessions;
    let stats = state.stats;

    if (currentTask && actualDurationMinutes > 0) {
      const session: FocusSession = {
        id: createId("session"),
        taskId: currentTask.id,
        projectId: currentTask.projectId,
        mode: "focus",
        plannedDurationMinutes: Math.round(timer.durationSeconds / 60),
        actualDurationMinutes,
        status: "partial",
        startedAt: timer.startedAt,
        endedAt,
        createdAt: endedAt,
      };
      const updatedTask: Task = {
        ...currentTask,
        actualFocusMinutes: currentTask.actualFocusMinutes + actualDurationMinutes,
        updatedAt: endedAt,
      };
      tasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      sessions = [session, ...sessions];
      const date = toDateKey(session.startedAt);
      stats = updateDailyStatsList(stats, date, (item) => {
        item.partialSessions += 1;
        item.totalFocusMinutes += actualDurationMinutes;
        if (currentTask.projectId) item.projectBreakdown[currentTask.projectId] = (item.projectBreakdown[currentTask.projectId] ?? 0) + actualDurationMinutes;
        return item;
      });
      await Promise.all([
        putRecord("tasks", updatedTask),
        putRecord("sessions", session),
        putRecord("stats", stats.find((item) => item.date === date)!),
      ]);
    }

    const plannedEndAt = new Date(Date.now() + timer.remainingSeconds * 1000).toISOString();
    const nextTimer: TimerRuntimeState = {
      ...timer,
      selectedTaskId: nextTask.id,
      selectedProjectId: nextTask.projectId,
      startedAt: endedAt,
      plannedEndAt,
      totalPausedSeconds: 0,
    };
    set({ tasks, sessions, stats, timer: nextTimer, toast: `Таймер переключен на задачу: ${nextTask.title}` });
    saveTimerRuntime(nextTimer);
  },

  dismissCompletionPrompt: () => set({ completionPrompt: undefined }),

  exportData: () =>
    createJsonExport({
      tasks: get().tasks,
      projects: get().projects,
      tags: get().tags,
      sessions: get().sessions,
      settings: get().settings,
      streak: get().streak,
      stats: get().stats,
    }),

  importData: async (payload) => {
    const settings = mergeSettings(payload.settings);
    await resetAllData();
    await Promise.all([
      ...payload.tasks.map((task) => putRecord("tasks", task)),
      ...payload.projects.map((project) => putRecord("projects", project)),
      ...payload.tags.map((tag) => putRecord("tags", tag)),
      ...payload.sessions.map((session) => putRecord("sessions", session)),
      ...payload.stats.map((stat) => putRecord("stats", stat)),
      saveSettings(settings),
      saveStreak(payload.streak),
    ]);
    set({
      tasks: payload.tasks,
      projects: payload.projects.length ? payload.projects : defaultProjects,
      tags: payload.tags,
      sessions: payload.sessions,
      settings,
      streak: payload.streak,
      stats: payload.stats,
      timer: defaultTimer(settings),
      toast: "Import complete.",
    });
  },

  resetApp: async () => {
    await resetAllData();
    defaultProjects.forEach((project) => void putRecord("projects", project));
    set({
      tasks: [],
      projects: defaultProjects,
      tags: [],
      sessions: [],
      settings: defaultSettings,
      streak: defaultStreak,
      stats: [],
      timer: defaultTimer(),
      breakSuggestion: undefined,
      completionPrompt: undefined,
      toast: "App reset.",
    });
  },
}));

export function selectActiveTasks(tasks: Task[]) {
  return tasks.filter((task) => task.status !== "completed" && task.status !== "archived");
}

export function dueSoon(task: Task) {
  if (!task.dueDate || task.status === "completed" || task.status === "archived") return false;
  const due = parseISO(task.dueDate);
  const tomorrow = addDays(new Date(), 1);
  return due <= tomorrow;
}
