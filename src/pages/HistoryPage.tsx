import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import type { FocusSessionStatus } from "../types/models";
import { exportFocusHistoryCsv } from "../utils/exportMarkdown";
import { downloadText, minutesToHuman } from "../utils/formatting";
import { humanDateTime } from "../utils/date";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

export function HistoryPage() {
  const sessions = useAppStore((state) => state.sessions);
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const deleteSession = useAppStore((state) => state.deleteSession);
  const [status, setStatus] = useState<FocusSessionStatus | "all">("all");
  const [projectId, setProjectId] = useState("");

  const filtered = useMemo(
    () =>
      sessions.filter((session) => {
        if (status !== "all" && session.status !== status) return false;
        if (projectId && session.projectId !== projectId) return false;
        return true;
      }),
    [projectId, sessions, status],
  );

  return (
    <div className="grid gap-5">
      <Card
        title="Focus History"
        eyebrow="Sessions"
        action={
          <Button
            icon={<Download className="h-4 w-4" />}
            onClick={() => downloadText("arsonist-focus-history.csv", exportFocusHistoryCsv(filtered, tasks, projects), "text/csv")}
          >
            Export CSV
          </Button>
        }
      >
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <Select value={status} onChange={(event) => setStatus(event.target.value as FocusSessionStatus | "all")}>
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-3">
          {filtered.map((session) => {
            const task = tasks.find((item) => item.id === session.taskId);
            const project = projects.find((item) => item.id === session.projectId);
            return (
              <article key={session.id} className="raised rounded-lg p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{task?.title ?? "Untitled focus"}</h3>
                      <Badge tone={session.status === "completed" ? "success" : session.status === "partial" ? "primary" : "danger"}>{session.status}</Badge>
                      <Badge tone="muted">{session.mode.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {project?.name ?? "Inbox"} · {humanDateTime(session.startedAt)} · {minutesToHuman(session.actualDurationMinutes)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    icon={<Trash2 className="h-4 w-4" />}
                    aria-label="Delete session"
                    onClick={() => {
                      if (window.confirm("Delete this session?")) void deleteSession(session.id);
                    }}
                  />
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && <EmptyState title="No focus history yet.">Complete your first session to see it here.</EmptyState>}
        </div>
      </Card>
    </div>
  );
}
