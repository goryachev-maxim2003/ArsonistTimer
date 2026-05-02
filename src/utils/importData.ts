import type { ArsonistExport } from "../types/models";

export function parseImportJson(raw: string): ArsonistExport {
  const parsed = JSON.parse(raw) as Partial<ArsonistExport>;
  if (parsed.app !== "Arsonist" || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.sessions)) {
    throw new Error("Could not import this file. The format is invalid.");
  }
  return parsed as ArsonistExport;
}
