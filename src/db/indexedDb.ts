import { openDB } from "idb";
import type { DailyStats, FocusSession, Project, Streak, Tag, Task, UserSettings } from "../types/models";
import { ARSONIST_DB_NAME, ARSONIST_DB_VERSION, ARSONIST_STORES, type ArsonistStoreName } from "./schema";

const TIMER_KEY = "arsonist_timer_runtime";

async function getDb() {
  return openDB(ARSONIST_DB_NAME, ARSONIST_DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("tasks")) db.createObjectStore("tasks", { keyPath: "id" });
      if (!db.objectStoreNames.contains("projects")) db.createObjectStore("projects", { keyPath: "id" });
      if (!db.objectStoreNames.contains("tags")) db.createObjectStore("tags", { keyPath: "id" });
      if (!db.objectStoreNames.contains("sessions")) db.createObjectStore("sessions", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "id" });
      if (!db.objectStoreNames.contains("stats")) db.createObjectStore("stats", { keyPath: "date" });
      if (!db.objectStoreNames.contains("streak")) db.createObjectStore("streak", { keyPath: "id" });
    },
  });
}

export async function getAllRecords<T>(store: ArsonistStoreName) {
  const db = await getDb();
  return db.getAll(store) as Promise<T[]>;
}

export async function putRecord<T extends object>(store: ArsonistStoreName, record: T) {
  const db = await getDb();
  await db.put(store, record);
}

export async function deleteRecord(store: ArsonistStoreName, id: string) {
  const db = await getDb();
  await db.delete(store, id);
}

export async function clearStore(store: ArsonistStoreName) {
  const db = await getDb();
  await db.clear(store);
}

export async function saveSettings(settings: UserSettings) {
  await putRecord("settings", { ...settings, id: "settings" });
}

export async function loadSettings() {
  const db = await getDb();
  const record = (await db.get("settings", "settings")) as (UserSettings & { id?: string }) | undefined;
  if (!record) return undefined;
  const { id: _id, ...settings } = record;
  return settings;
}

export async function saveStreak(streak: Streak) {
  await putRecord("streak", { ...streak, id: "streak" });
}

export async function loadStreak() {
  const db = await getDb();
  const record = (await db.get("streak", "streak")) as (Streak & { id?: string }) | undefined;
  if (!record) return undefined;
  const { id: _id, ...streak } = record;
  return streak;
}

export async function resetAllData() {
  await Promise.all(ARSONIST_STORES.map((store) => clearStore(store)));
  localStorage.removeItem(TIMER_KEY);
}

export async function loadAllData() {
  const [tasks, projects, tags, sessions, settings, stats, streak] = await Promise.all([
    getAllRecords<Task>("tasks"),
    getAllRecords<Project>("projects"),
    getAllRecords<Tag>("tags"),
    getAllRecords<FocusSession>("sessions"),
    loadSettings(),
    getAllRecords<DailyStats>("stats"),
    loadStreak(),
  ]);

  return { tasks, projects, tags, sessions, settings, stats, streak };
}

export function saveTimerRuntime(value: unknown) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(value));
}

export function loadTimerRuntime<T>() {
  const raw = localStorage.getItem(TIMER_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export async function getDatabaseInfo() {
  const db = await getDb();
  const counts = Object.fromEntries(
    await Promise.all(ARSONIST_STORES.map(async (store) => [store, await db.count(store)])),
  ) as Record<ArsonistStoreName, number>;
  const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : undefined;

  return {
    name: ARSONIST_DB_NAME,
    version: ARSONIST_DB_VERSION,
    stores: ARSONIST_STORES,
    counts,
    usageBytes: estimate?.usage,
    quotaBytes: estimate?.quota,
  };
}
