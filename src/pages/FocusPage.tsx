import { Card } from "../components/ui/Card";
import { FocusTimer } from "../components/timer/FocusTimer";
import { useAppStore } from "../store/appStore";
import { minutesToHuman } from "../utils/formatting";

export function FocusPage() {
  const sessions = useAppStore((state) => state.sessions);
  const todayFocus = sessions
    .filter((session) => session.mode === "focus" && session.status !== "cancelled" && new Date(session.startedAt).toDateString() === new Date().toDateString())
    .reduce((sum, session) => sum + session.actualDurationMinutes, 0);

  return (
    <div className="grid gap-5">
      <FocusTimer />
      <section className="grid gap-5 md:grid-cols-3">
        <Card title="Today">
          <p className="text-3xl font-bold">{minutesToHuman(todayFocus)}</p>
          <p className="text-sm text-[var(--muted)]">focus recorded</p>
        </Card>
        <Card title="Completed">
          <p className="text-3xl font-bold">{sessions.filter((session) => session.status === "completed" && session.mode === "focus").length}</p>
          <p className="text-sm text-[var(--muted)]">focus sessions</p>
        </Card>
        <Card title="Privacy">
          <p className="text-sm text-[var(--muted)]">Timer state is persisted locally and recalculated from wall-clock time.</p>
        </Card>
      </section>
    </div>
  );
}
