import { useEffect, useMemo, useState } from "react";
import type { Priority, RecurrenceFrequency, RecurrenceRule, Task } from "../../types/models";
import { useAppStore } from "../../store/appStore";
import { createId } from "../../utils/ids";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface TaskEditorProps {
  open: boolean;
  task?: Task;
  presetDate?: string;
  onClose: () => void;
}

export function TaskEditor({ open, task, presetDate, onClose }: TaskEditorProps) {
  const projects = useAppStore((state) => state.projects);
  const tags = useAppStore((state) => state.tags);
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const ensureTag = useAppStore((state) => state.ensureTag);
  const addSubtask = useAppStore((state) => state.addSubtask);
  const toggleSubtask = useAppStore((state) => state.toggleSubtask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [tagText, setTagText] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency | "none">("none");
  const [subtaskText, setSubtaskText] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setNotes(task?.notes ?? "");
    setProjectId(task?.projectId ?? "project_inbox");
    setPriority(task?.priority ?? "medium");
    setDueDate(task?.dueDate ?? presetDate ?? "");
    setEstimatedPomodoros(task?.estimatedPomodoros ?? 1);
    setTagText(task ? tags.filter((tag) => task.tagIds.includes(tag.id)).map((tag) => tag.name).join(", ") : "");
    setRecurrence(task?.recurrence?.frequency ?? "none");
  }, [open, presetDate, tags, task]);

  const recurrenceRule = useMemo<RecurrenceRule | undefined>(() => {
    if (recurrence === "none") return undefined;
    return { frequency: recurrence, interval: 1 };
  }, [recurrence]);

  const save = async () => {
    const tagNames = tagText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const tag = await ensureTag(name);
      tagIds.push(tag.id);
    }

    if (task) {
      await updateTask(task.id, {
        title,
        description,
        notes,
        projectId,
        priority,
        dueDate,
        scheduledDate: dueDate,
        estimatedPomodoros,
        tagIds,
        recurrence: recurrenceRule,
      });
    } else {
      await createTask({
        title,
        description,
        notes,
        projectId,
        priority,
        dueDate,
        scheduledDate: dueDate,
        estimatedPomodoros,
        tagIds,
        recurrence: recurrenceRule,
      });
    }
    onClose();
  };

  const addLocalSubtask = async () => {
    if (!subtaskText.trim()) return;
    if (task) {
      await addSubtask(task.id, subtaskText);
    } else {
      setTitle(title || "New task");
    }
    setSubtaskText("");
  };

  return (
    <Modal open={open} title={task ? "Edit task" : "Create task"} onClose={onClose}>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Title
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Finish lab report" />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Description
          <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short context" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Project
            <Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Priority
            <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Due date
            <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Pomodoros
            <Input type="number" min={0} value={estimatedPomodoros} onChange={(event) => setEstimatedPomodoros(Number(event.target.value))} />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Tags
          <Input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="coding, urgent, writing" />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Recurrence
          <Select value={recurrence} onChange={(event) => setRecurrence(event.target.value as RecurrenceFrequency | "none")}>
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Notes
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Markdown-friendly notes" />
        </label>
        {task && (
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Subtasks</p>
            {task.subtasks.map((subtask) => (
              <label key={subtask.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-2 text-sm">
                <input type="checkbox" checked={subtask.completed} onChange={() => void toggleSubtask(task.id, subtask.id)} />
                <span className={subtask.completed ? "line-through text-[var(--muted)]" : ""}>{subtask.title}</span>
              </label>
            ))}
            <div className="flex gap-2">
              <Input value={subtaskText} onChange={(event) => setSubtaskText(event.target.value)} placeholder="Add subtask" />
              <Button type="button" onClick={() => void addLocalSubtask()}>
                Add
              </Button>
            </div>
          </div>
        )}
        {!task && (
          <p className="text-xs text-[var(--muted)]">
            Subtasks are available after saving. New tasks receive stable local ids like {createId("task").slice(0, 12)}.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void save()}>
            Save task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
