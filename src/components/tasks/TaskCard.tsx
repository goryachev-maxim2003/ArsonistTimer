import { Archive, Check, Copy, Flame, Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import type { Task } from "../../types/models";
import { humanDate, isOverdueDate } from "../../utils/date";
import { minutesToHuman } from "../../utils/formatting";
import { recurrenceLabel } from "../../utils/recurrence";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { PriorityBadge } from "./PriorityBadge";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const projects = useAppStore((state) => state.projects);
  const tags = useAppStore((state) => state.tags);
  const completeTask = useAppStore((state) => state.completeTask);
  const archiveTask = useAppStore((state) => state.archiveTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const duplicateTask = useAppStore((state) => state.duplicateTask);
  const startTimer = useAppStore((state) => state.startTimer);
  const project = projects.find((item) => item.id === task.projectId);
  const taskTags = tags.filter((tag) => task.tagIds.includes(tag.id));
  const subtasksCompleted = task.subtasks.filter((subtask) => subtask.completed).length;
  const complete = task.status === "completed";

  return (
    <article className={`raised rounded-lg p-4 ${complete ? "opacity-70" : ""}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-base font-semibold ${complete ? "line-through text-[var(--muted)]" : "text-[var(--text)]"}`}>{task.title}</h3>
            <PriorityBadge priority={task.priority} />
            {task.status === "in_progress" && <Badge tone="primary">in progress</Badge>}
            {isOverdueDate(task.dueDate) && task.status !== "completed" && <Badge tone="danger">overdue</Badge>}
            {task.recurrence && <Badge tone="primary">{recurrenceLabel(task.recurrence)}</Badge>}
          </div>
          {task.description && <p className="mt-2 text-sm text-[var(--muted)]">{task.description}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span>{project?.name ?? "Inbox"}</span>
            <span>Due {humanDate(task.dueDate)}</span>
            <span>
              {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
            </span>
            <span>{minutesToHuman(task.actualFocusMinutes)} focused</span>
            {task.subtasks.length > 0 && (
              <span>
                {subtasksCompleted}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
          {taskTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {taskTags.map((tag) => (
                <span key={tag.id} className="rounded-full px-2 py-1 text-xs font-semibold" style={{ color: tag.color, background: `${tag.color}22` }}>
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Button variant="ghost" icon={<Flame className="h-4 w-4" />} aria-label="Start focus" onClick={() => void startTimer("focus", task.id)} />
          <Button variant="ghost" icon={<Check className="h-4 w-4" />} aria-label="Complete task" onClick={() => void completeTask(task.id)} disabled={complete} />
          <Button variant="ghost" icon={<Pencil className="h-4 w-4" />} aria-label="Edit task" onClick={() => onEdit(task)} />
          <Button variant="ghost" icon={<Copy className="h-4 w-4" />} aria-label="Duplicate task" onClick={() => void duplicateTask(task.id)} />
          <Button variant="ghost" icon={<Archive className="h-4 w-4" />} aria-label="Archive task" onClick={() => void archiveTask(task.id)} />
          <Button
            variant="ghost"
            icon={<Trash2 className="h-4 w-4" />}
            aria-label="Delete task"
            onClick={() => {
              if (window.confirm("Delete this task?")) void deleteTask(task.id);
            }}
          />
        </div>
      </div>
    </article>
  );
}
