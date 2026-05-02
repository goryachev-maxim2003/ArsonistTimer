import { Flame, Pause, Play, RotateCcw, SkipForward, Square, CheckCircle2 } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { secondsToClock } from "../../utils/formatting";
import { Button } from "../ui/Button";
import { ProgressRing } from "../ui/ProgressRing";
import { Select } from "../ui/Input";

const modeLabels = {
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break",
};

export function FocusTimer() {
  const timer = useAppStore((state) => state.timer);
  const tasks = useAppStore((state) => state.tasks);
  const settings = useAppStore((state) => state.settings);
  const breakSuggestion = useAppStore((state) => state.breakSuggestion);
  const selectTimerTask = useAppStore((state) => state.selectTimerTask);
  const startTimer = useAppStore((state) => state.startTimer);
  const pauseTimer = useAppStore((state) => state.pauseTimer);
  const resumeTimer = useAppStore((state) => state.resumeTimer);
  const stopTimer = useAppStore((state) => state.stopTimer);
  const completeTimer = useAppStore((state) => state.completeTimer);
  const resetTimer = useAppStore((state) => state.resetTimer);
  const skipTimer = useAppStore((state) => state.skipTimer);
  const activeTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "archived");
  const progress = timer.durationSeconds ? ((timer.durationSeconds - timer.remainingSeconds) / timer.durationSeconds) * 100 : 0;
  const arsonist = settings.appearance.brandTone === "arsonist";
  const labels = {
    start: arsonist ? "Ignite Focus" : "Start Focus",
    pause: arsonist ? "Pause Flame" : "Pause",
    resume: arsonist ? "Resume Burn" : "Resume",
    stop: arsonist ? "Extinguish" : "Stop",
    complete: arsonist ? "Burn Complete" : "Complete",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="surface glow rounded-lg p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{modeLabels[timer.mode]}</p>
        <div className="my-8 flex justify-center">
          <ProgressRing value={progress} label={secondsToClock(timer.remainingSeconds)} size={240} stroke={14} />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {timer.status === "running" ? (
            <Button variant="primary" icon={<Pause className="h-4 w-4" />} onClick={pauseTimer}>
              {labels.pause}
            </Button>
          ) : timer.status === "paused" ? (
            <Button variant="primary" icon={<Play className="h-4 w-4" />} onClick={resumeTimer}>
              {labels.resume}
            </Button>
          ) : (
            <Button variant="primary" icon={<Flame className="h-4 w-4" />} onClick={() => void startTimer(timer.mode)}>
              {timer.mode === "focus" ? labels.start : "Start Break"}
            </Button>
          )}
          <Button variant="secondary" icon={<Square className="h-4 w-4" />} onClick={() => void stopTimer()}>
            {labels.stop}
          </Button>
          <Button variant="secondary" icon={<CheckCircle2 className="h-4 w-4" />} disabled={!settings.timer.allowManualCompletion} onClick={() => void completeTimer("completed")}>
            {labels.complete}
          </Button>
          <Button variant="ghost" icon={<SkipForward className="h-4 w-4" />} onClick={skipTimer}>
            Skip
          </Button>
          <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => resetTimer(timer.mode)}>
            Reset
          </Button>
        </div>
        {breakSuggestion && (
          <div className="mt-5 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-4">
            <p className="font-semibold">{breakSuggestion === "long_break" ? "Long break unlocked" : "Short break ready"}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Your completed focus session is saved.</p>
            <Button className="mt-3" variant="primary" onClick={() => void startTimer(breakSuggestion)}>
              Start {modeLabels[breakSuggestion]}
            </Button>
          </div>
        )}
      </div>
      <aside className="surface rounded-lg p-5">
        <h2 className="text-lg font-semibold">Session setup</h2>
        <label className="mt-4 grid gap-2 text-sm font-semibold">
          Task
          <Select value={timer.selectedTaskId ?? ""} onChange={(event) => selectTimerTask(event.target.value || undefined)}>
            <option value="">No task selected</option>
            {activeTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </Select>
        </label>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["focus", "short_break", "long_break"] as const).map((mode) => (
            <button
              key={mode}
              className={`rounded-lg border px-2 py-3 text-xs font-semibold ${
                timer.mode === mode ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]" : "border-[var(--border)] text-[var(--muted)]"
              }`}
              onClick={() => resetTimer(mode)}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Status</dt>
            <dd className="font-semibold capitalize">{timer.status}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Cycle</dt>
            <dd className="font-semibold">
              {timer.completedFocusSessionsInCycle}/{settings.timer.longBreakInterval}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Accurate mode</dt>
            <dd className="font-semibold">plannedEndAt</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
