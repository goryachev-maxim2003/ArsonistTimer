import { useMemo, useState } from "react";
import { BookOpen, Download, Flame, LineChart, Plus, Settings, Target } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { downloadText } from "../../utils/formatting";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function CommandBar() {
  const open = useAppStore((state) => state.commandOpen);
  const setOpen = useAppStore((state) => state.setCommandOpen);
  const quickAddTask = useAppStore((state) => state.quickAddTask);
  const setRoute = useAppStore((state) => state.setRoute);
  const startTimer = useAppStore((state) => state.startTimer);
  const exportData = useAppStore((state) => state.exportData);
  const [query, setQuery] = useState("");

  const actions = useMemo(
    () => [
      { label: "Start focus", icon: Flame, run: () => void startTimer("focus") },
      { label: "Open today", icon: Target, run: () => setRoute("dashboard") },
      { label: "Open stats", icon: LineChart, run: () => setRoute("stats") },
      { label: "Open guide", icon: BookOpen, run: () => setRoute("guide") },
      { label: "Open settings", icon: Settings, run: () => setRoute("settings") },
      {
        label: "Export data",
        icon: Download,
        run: () => downloadText("arsonist-export.json", JSON.stringify(exportData(), null, 2), "application/json"),
      },
    ],
    [exportData, setRoute, startTimer],
  );

  if (!open) return null;

  const submit = async () => {
    if (!query.trim()) return;
    await quickAddTask(query);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 p-4 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div className="mx-auto mt-20 w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <label className="mb-2 block text-sm font-semibold text-[var(--muted)]" htmlFor="command-input">
          Quick add or choose an action
        </label>
        <div className="flex gap-2">
          <Input
            id="command-input"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit();
            }}
            placeholder="Finish lab report tomorrow high 3p #university"
          />
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => void submit()}>
            Add
          </Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-left text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
                onClick={() => {
                  action.run();
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4 text-[var(--primary)]" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
