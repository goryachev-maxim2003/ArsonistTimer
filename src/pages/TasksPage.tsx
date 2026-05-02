import { useEffect, useState, type CSSProperties, type FormEvent, type MouseEvent } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronRight, Folder, FolderPlus, MoreHorizontal, Pause, Pencil, Play, Plus, Square, Trash2 } from "lucide-react";
import type { Project, Task } from "../types/models";
import { useAppStore } from "../store/appStore";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { secondsToClock } from "../utils/formatting";

type MenuState = {
  type: "task";
  task: Task;
  x: number;
  y: number;
} | {
  type: "project";
  project: Project;
  x: number;
  y: number;
};

type ProjectTaskDraftRow = {
  title: string;
  estimate: string;
};

type DialogState =
  | { type: "delete"; task: Task }
  | { type: "deleteProject"; project: Project }
  | { type: "rename"; task: Task; value: string }
  | { type: "createTaskInProject"; project: Project; tasks: ProjectTaskDraftRow[] }
  | { type: "createProjectWithTasks"; projectName: string; tasks: ProjectTaskDraftRow[] }
  | {
      type: "project";
      task: Task;
      query: string;
      newProjectName: string;
      editingProjectId?: string;
      editingProjectName?: string;
      deletingProject?: Project;
    };

function estimateLabel(task: Task) {
  return `${task.completedPomodoros}/${task.estimatedPomodoros}`;
}

function remainingMinutes(tasks: Task[], focusMinutes: number) {
  return tasks.reduce((sum, task) => sum + Math.max(0, task.estimatedPomodoros - task.completedPomodoros) * focusMinutes, 0);
}

function minutesHuman(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${rest}м`;
  if (rest === 0) return `${hours}ч`;
  return `${hours}ч ${rest}м`;
}

function clampPomodoros(value: string | number, min = 1, max = 99) {
  const parsed = Number(value);
  if (String(value).trim() === "" || !Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function emptyProjectTaskDraft(): ProjectTaskDraftRow {
  return { title: "", estimate: "1" };
}

const flameIndexes = Array.from({ length: 13 }, (_, index) => index);
const sparkIndexes = Array.from({ length: 16 }, (_, index) => index);
const PROJECT_COLLAPSE_STORAGE_KEY = "arsonist_project_collapsed";

function loadProjectCollapseState() {
  try {
    const raw = localStorage.getItem(PROJECT_COLLAPSE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === "boolean")) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function TaskRow({
  task,
  burning,
  onComplete,
  onMenu,
}: {
  task: Task;
  burning: boolean;
  onComplete: (task: Task) => void;
  onMenu: (event: MouseEvent, task: Task) => void;
}) {
  const timer = useAppStore((state) => state.timer);
  const startTimer = useAppStore((state) => state.startTimer);
  const switchTimerTask = useAppStore((state) => state.switchTimerTask);
  const isActive = timer.selectedTaskId === task.id && timer.status !== "idle";

  const startOrSwitch = async () => {
    if (timer.status === "running" && timer.mode === "focus") {
      await switchTimerTask(task.id);
      return;
    }
    await startTimer("focus", task.id);
  };

  return (
    <article
      className={`group relative flex min-h-[4.4rem] items-center gap-3 overflow-hidden rounded-lg border border-transparent bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--border)] ${isActive ? "border-[var(--primary)]/50 bg-[var(--primary)]/10" : ""} ${burning ? "task-burn pointer-events-none" : ""}`}
      onContextMenu={(event) => onMenu(event, task)}
    >
      <button
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--muted)] text-transparent transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        aria-label="Завершить задачу"
        disabled={burning}
        onClick={() => onComplete(task)}
      >
        <Check className="h-4 w-4" />
      </button>

      <button
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ember-danger/30 text-ember-danger transition hover:bg-ember-danger hover:text-white"
        aria-label="Запустить таймер"
        onClick={() => void startOrSwitch()}
      >
        <Play className="h-4 w-4 fill-current" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-medium text-[var(--text)]">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs font-semibold">
          <span className="text-ember-danger">🍅 {estimateLabel(task)}</span>
          {task.actualFocusMinutes > 0 && <span className="ml-2 text-[var(--muted)]">{minutesHuman(task.actualFocusMinutes)}</span>}
        </div>
      </div>

      {task.dueDate && <time className="hidden text-sm font-medium text-ember-danger sm:block">{task.dueDate}</time>}
      <button
        type="button"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--text)]"
        aria-label="Открыть меню задачи"
        onClick={(event) => onMenu(event, task)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {burning && (
        <div className="task-fire-scene" aria-hidden="true">
          <div className="task-fire-front">
            {flameIndexes.map((index) => (
              <span
                key={index}
                className="task-flame"
                style={
                  {
                    "--x": `${index * 8.2}%`,
                    "--w": `${2.1 + (index % 4) * 0.35}rem`,
                    "--h": `${3 + (index % 5) * 0.42}rem`,
                    "--delay": `${index * 0.018}s`,
                    "--loop-delay": `${index * -0.035}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="task-embers">
            {sparkIndexes.map((index) => (
              <span
                key={index}
                className="task-spark"
                style={
                  {
                    "--x": `${8 + index * 5.8}%`,
                    "--dx": `${(index - 7) * 0.32}rem`,
                    "--delay": `${index * 0.028}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="task-smoke" />
        </div>
      )}
    </article>
  );
}

function ActiveTimer() {
  const timer = useAppStore((state) => state.timer);
  const tasks = useAppStore((state) => state.tasks);
  const pauseTimer = useAppStore((state) => state.pauseTimer);
  const resumeTimer = useAppStore((state) => state.resumeTimer);
  const stopTimer = useAppStore((state) => state.stopTimer);
  const startTimer = useAppStore((state) => state.startTimer);
  const switchTimerTask = useAppStore((state) => state.switchTimerTask);
  const selectedTask = tasks.find((task) => task.id === timer.selectedTaskId);
  const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "archived");

  if (timer.status === "idle" && !selectedTask) return null;

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--raised)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{timer.mode === "focus" ? "Фокус" : timer.mode === "short_break" ? "Короткий перерыв" : "Длинный перерыв"}</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{secondsToClock(timer.remainingSeconds)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{selectedTask?.title ?? "Задача не выбрана"}</p>
        </div>

        <div className="grid gap-3 lg:min-w-[28rem]">
          <Select
            value={timer.selectedTaskId ?? ""}
            onChange={(event) => {
              if (event.target.value) void switchTimerTask(event.target.value);
            }}
            aria-label="Сменить задачу таймера"
          >
            <option value="">Задача не выбрана</option>
            {openTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2">
            {timer.status === "running" ? (
              <Button icon={<Pause className="h-4 w-4" />} onClick={pauseTimer}>
                Пауза
              </Button>
            ) : (
              <Button icon={<Play className="h-4 w-4" />} onClick={() => (timer.status === "paused" ? resumeTimer() : void startTimer(timer.mode, timer.selectedTaskId))}>
                Продолжить
              </Button>
            )}
            <Button variant="danger" icon={<Square className="h-4 w-4" />} onClick={() => void stopTimer()}>
              Остановить
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompletionPrompt() {
  const prompt = useAppStore((state) => state.completionPrompt);
  const breakSuggestion = useAppStore((state) => state.breakSuggestion);
  const timer = useAppStore((state) => state.timer);
  const tasks = useAppStore((state) => state.tasks);
  const startTimer = useAppStore((state) => state.startTimer);
  const resetTimer = useAppStore((state) => state.resetTimer);
  const dismiss = useAppStore((state) => state.dismissCompletionPrompt);
  const firstTask = tasks.find((task) => task.status !== "completed" && task.status !== "archived");
  if (!prompt) return null;

  const isBreak = prompt !== "focus";
  const title = isBreak ? "Перерыв закончился" : "Фокус завершен";
  const text = isBreak ? "Можно сразу вернуться к задаче." : "Сессия сохранена. Запустить перерыв или продолжить работу?";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Таймер</p>
        <h2 className="mt-2 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {isBreak ? (
            <Button
              variant="primary"
              onClick={() => {
                dismiss();
                void startTimer("focus", timer.selectedTaskId ?? firstTask?.id);
              }}
            >
              Запустить задачу
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                dismiss();
                void startTimer(breakSuggestion ?? "short_break", timer.selectedTaskId);
              }}
            >
              Запустить перерыв
            </Button>
          )}
          <Button
            onClick={() => {
              dismiss();
              resetTimer("focus");
            }}
          >
            Пропустить
          </Button>
        </div>
      </section>
    </div>
  );
}

export function TasksPage() {
  const tasks = useAppStore((state) => state.tasks);
  const allProjects = useAppStore((state) => state.projects);
  const settings = useAppStore((state) => state.settings);
  const createTask = useAppStore((state) => state.createTask);
  const createProject = useAppStore((state) => state.createProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const deleteProject = useAppStore((state) => state.deleteProject);
  const updateTask = useAppStore((state) => state.updateTask);
  const completeTask = useAppStore((state) => state.completeTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const playTaskBurn = useAppStore((state) => state.playTaskBurn);
  const [title, setTitle] = useState("");
  const [estimate, setEstimate] = useState("1");
  const [menuEstimate, setMenuEstimate] = useState("1");
  const [menu, setMenu] = useState<MenuState | undefined>();
  const [dialog, setDialog] = useState<DialogState | undefined>();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => loadProjectCollapseState());
  const [burningTaskIds, setBurningTaskIds] = useState<Record<string, boolean>>({});
  const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "archived");
  const projects = allProjects.filter((project) => !project.archived && project.id !== "project_inbox");
  const unassigned = openTasks.filter((task) => !task.projectId || task.projectId === "project_inbox");
  const projectGroups = projects
    .map((project) => ({
      project,
      tasks: openTasks.filter((task) => task.projectId === project.id),
    }));

  const totalMinutes = remainingMinutes(openTasks, settings.timer.focusMinutes);
  const activeMenuTask = menu?.type === "task" ? tasks.find((task) => task.id === menu.task.id) ?? menu.task : undefined;

  useEffect(() => {
    localStorage.setItem(PROJECT_COLLAPSE_STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const openTaskMenu = (event: MouseEvent, task: Task) => {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 256;
    const menuHeight = 340;
    setMenu({
      type: "task",
      task,
      x: Math.max(12, Math.min(event.clientX, window.innerWidth - menuWidth - 12)),
      y: Math.max(12, Math.min(event.clientY, window.innerHeight - menuHeight - 12)),
    });
    setMenuEstimate(String(task.estimatedPomodoros));
  };

  const openProjectMenu = (event: MouseEvent, project: Project) => {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 256;
    const menuHeight = 96;
    setMenu({
      type: "project",
      project,
      x: Math.max(12, Math.min(event.clientX, window.innerWidth - menuWidth - 12)),
      y: Math.max(12, Math.min(event.clientY, window.innerHeight - menuHeight - 12)),
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await createTask({ title: title.trim(), estimatedPomodoros: clampPomodoros(estimate) });
    setTitle("");
    setEstimate("1");
  };

  const changeProject = async (task: Task, projectId?: string) => {
    await updateTask(task.id, { projectId });
    setMenu(undefined);
  };

  const createProjectForTask = async (task: Task) => {
    const projectDialog = dialog?.type === "project" ? dialog : undefined;
    const name = projectDialog?.newProjectName.trim();
    if (!name) return;
    const project = await createProject({ name });
    if (project) await updateTask(task.id, { projectId: project.id });
    setDialog(project ? undefined : projectDialog);
  };

  const renameProjectFromDialog = async () => {
    const projectDialog = dialog?.type === "project" ? dialog : undefined;
    const projectId = projectDialog?.editingProjectId;
    const name = projectDialog?.editingProjectName?.trim();
    if (!projectId || !name) return;
    await updateProject(projectId, { name });
    setDialog({ ...projectDialog, editingProjectId: undefined, editingProjectName: undefined });
  };

  const deleteProjectFromDialog = async () => {
    const projectDialog = dialog?.type === "project" ? dialog : undefined;
    if (!projectDialog?.deletingProject) return;
    await deleteProject(projectDialog.deletingProject.id);
    const taskProjectDeleted = projectDialog.task.projectId === projectDialog.deletingProject.id;
    setDialog({
      ...projectDialog,
      task: taskProjectDeleted ? { ...projectDialog.task, projectId: undefined } : projectDialog.task,
      deletingProject: undefined,
      editingProjectId: projectDialog.editingProjectId === projectDialog.deletingProject.id ? undefined : projectDialog.editingProjectId,
      editingProjectName: projectDialog.editingProjectId === projectDialog.deletingProject.id ? undefined : projectDialog.editingProjectName,
    });
  };

  const assignProjectFromDialog = async (task: Task, projectId?: string) => {
    await updateTask(task.id, { projectId });
    setDialog(undefined);
  };

  const renameTask = async (task: Task) => {
    const renameDialog = dialog?.type === "rename" ? dialog : undefined;
    const next = renameDialog?.value.trim();
    if (!next) return;
    await updateTask(task.id, { title: next });
    setDialog(undefined);
  };

  const confirmDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
    setDialog(undefined);
  };

  const confirmDeleteProject = async (project: Project) => {
    await deleteProject(project.id);
    setDialog(undefined);
  };

  const taskDraftRows = dialog?.type === "createTaskInProject" || dialog?.type === "createProjectWithTasks" ? dialog.tasks : [];

  const updateTaskDraftRow = (index: number, patch: Partial<ProjectTaskDraftRow>) => {
    setDialog((state) => {
      if (state?.type !== "createTaskInProject" && state?.type !== "createProjectWithTasks") return state;
      return {
        ...state,
        tasks: state.tasks.map((task, taskIndex) => (taskIndex === index ? { ...task, ...patch } : task)),
      };
    });
  };

  const addTaskDraftRow = () => {
    setDialog((state) => {
      if (state?.type !== "createTaskInProject" && state?.type !== "createProjectWithTasks") return state;
      return { ...state, tasks: [...state.tasks, emptyProjectTaskDraft()] };
    });
  };

  const removeTaskDraftRow = (index: number) => {
    setDialog((state) => {
      if (state?.type !== "createTaskInProject" && state?.type !== "createProjectWithTasks") return state;
      if (state.tasks.length <= 1) return { ...state, tasks: [emptyProjectTaskDraft()] };
      return { ...state, tasks: state.tasks.filter((_, taskIndex) => taskIndex !== index) };
    });
  };

  const changeTaskDraftEstimate = (index: number, value: string | number) => {
    updateTaskDraftRow(index, { estimate: String(value) });
  };

  const createTasksInProject = async (projectId: string, rows: ProjectTaskDraftRow[]) => {
    const preparedTasks = rows
      .map((task) => ({ title: task.title.trim(), estimatedPomodoros: clampPomodoros(task.estimate) }))
      .filter((task) => task.title);

    for (const task of preparedTasks) {
      await createTask({ ...task, projectId });
    }

    return preparedTasks.length;
  };

  const createTaskInProject = async () => {
    const createDialog = dialog?.type === "createTaskInProject" ? dialog : undefined;
    if (!createDialog) return;
    const createdCount = await createTasksInProject(createDialog.project.id, createDialog.tasks);
    if (createdCount > 0) {
      setCollapsed((state) => ({ ...state, [createDialog.project.id]: false }));
      setDialog(undefined);
    }
  };

  const createProjectWithTasks = async () => {
    const createDialog = dialog?.type === "createProjectWithTasks" ? dialog : undefined;
    const projectName = createDialog?.projectName.trim();
    if (!createDialog || !projectName) return;
    const project = await createProject({ name: projectName });
    if (!project) return;
    await createTasksInProject(project.id, createDialog.tasks);
    setCollapsed((state) => ({ ...state, [project.id]: false }));
    setDialog(undefined);
  };

  const updateTaskEstimateInMenu = async (task: Task, value: string | number) => {
    const nextEstimate = clampPomodoros(value);
    setMenuEstimate(String(nextEstimate));
    setMenu((state) =>
      state?.type === "task" && state.task.id === task.id
        ? { ...state, task: { ...state.task, estimatedPomodoros: nextEstimate } }
        : state,
    );
    await updateTask(task.id, { estimatedPomodoros: nextEstimate });
  };

  const commitMenuEstimate = (task: Task) => {
    void updateTaskEstimateInMenu(task, menuEstimate);
  };

  const menuEstimateBase = (task: Task) => {
    if (menuEstimate.trim() === "") return task.estimatedPomodoros;
    return clampPomodoros(menuEstimate);
  };

  const completeTaskWithBurn = (task: Task) => {
    if (burningTaskIds[task.id]) return;
    setBurningTaskIds((state) => ({ ...state, [task.id]: true }));
    playTaskBurn();
    window.setTimeout(() => {
      void completeTask(task.id).finally(() => {
        setBurningTaskIds((state) => {
          const next = { ...state };
          delete next[task.id];
          return next;
        });
      });
    }, 1600);
  };

  const projectDialog = dialog?.type === "project" ? dialog : undefined;
  const visibleProjects = projectDialog
    ? projects.filter((project) => project.name.toLowerCase().includes(projectDialog.query.trim().toLowerCase()))
    : [];
  const hasTaskDraftTitle = taskDraftRows.some((task) => task.title.trim());

  const renderProjectTaskDraftRows = () => (
    <div className="mt-4 grid gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Задачи</p>
      {taskDraftRows.map((task, index) => (
        <div key={index} className="rounded-lg border border-[var(--border)] bg-black/10 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={task.title}
              placeholder="Задача"
              autoFocus={dialog?.type === "createTaskInProject" && index === 0}
              onChange={(event) => updateTaskDraftRow(index, { title: event.target.value })}
            />
            {taskDraftRows.length > 1 && (
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ember-danger transition hover:bg-ember-danger/10"
                aria-label="Убрать задачу"
                onClick={() => removeTaskDraftRow(index)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button type="button" onClick={() => changeTaskDraftEstimate(index, Math.max(1, clampPomodoros(task.estimate) - 1))}>
              −
            </Button>
            <label className="flex min-w-20 items-center gap-1 rounded-lg border border-[var(--border)] bg-black/10 px-2 py-1 font-bold text-[var(--text)] focus-within:border-[var(--primary)]">
              <span aria-hidden="true">🍅</span>
              <input
                type="number"
                min={1}
                max={99}
                value={task.estimate}
                aria-label="Количество помидоров"
                className="h-8 w-12 bg-transparent text-center text-[var(--text)] outline-none"
                onChange={(event) => updateTaskDraftRow(index, { estimate: event.target.value })}
                onBlur={() => updateTaskDraftRow(index, { estimate: String(clampPomodoros(task.estimate)) })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !task.title.trim()) event.currentTarget.blur();
                }}
              />
            </label>
            <Button type="button" onClick={() => changeTaskDraftEstimate(index, Math.min(99, clampPomodoros(task.estimate) + 1))}>
              +
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" icon={<Plus className="h-4 w-4" />} onClick={addTaskDraftRow}>
        Добавить ещё задачу
      </Button>
    </div>
  );

  const collapseAllProjects = () => {
    setCollapsed((state) => ({
      ...state,
      ...Object.fromEntries(projectGroups.map((group) => [group.project.id, true])),
    }));
  };

  const expandAllProjects = () => {
    setCollapsed((state) => ({
      ...state,
      ...Object.fromEntries(projectGroups.map((group) => [group.project.id, false])),
    }));
  };

  const renderGroup = (project: Project, groupTasks: Task[]) => {
    const id = project.id;
    const isCollapsed = collapsed[id] ?? true;
    return (
      <section key={id} className="grid gap-2">
        <div
          className="flex items-center gap-2 px-1 py-2 text-left text-lg font-bold text-[var(--text)]"
          onContextMenu={(event) => openProjectMenu(event, project)}
        >
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--text)]"
            aria-label={isCollapsed ? "Раскрыть проект" : "Скрыть проект"}
            onClick={() => setCollapsed((state) => ({ ...state, [id]: !(state[id] ?? true) }))}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          <Folder className="h-5 w-5 text-[var(--primary)]" />
          <span>{project.name}</span>
          <span className="text-sm text-[var(--muted)]">• {minutesHuman(remainingMinutes(groupTasks, settings.timer.focusMinutes))}</span>
        </div>
        {!isCollapsed && (
          <div className="grid gap-1">
            {groupTasks.map((task) => (
              <TaskRow key={task.id} task={task} burning={Boolean(burningTaskIds[task.id])} onComplete={completeTaskWithBurn} onMenu={openTaskMenu} />
            ))}
            {groupTasks.length === 0 && <p className="rounded-lg border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">В проекте пока нет задач.</p>}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="grid gap-5" onClick={() => setMenu(undefined)}>
      <form onSubmit={submit} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--raised)] p-2">
        <button
          type="submit"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--primary)]"
          aria-label="Добавить задачу"
          title="Добавить задачу"
        >
          <Plus className="h-5 w-5" />
        </button>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Задача"
          className="border-transparent bg-transparent text-lg"
        />
        <div className="flex shrink-0 items-center gap-2 border-l border-[var(--border)] pl-3">
          <button type="button" className="rounded-md px-2 py-1 text-lg text-[var(--muted)] hover:bg-white/5" onClick={() => setEstimate((value) => String(Math.max(1, clampPomodoros(value) - 1)))}>
            −
          </button>
          <label className="flex min-w-20 items-center gap-1 rounded-lg border border-transparent bg-black/10 px-2 py-1 text-sm font-bold text-[var(--text)] focus-within:border-[var(--primary)]">
            <span aria-hidden="true">🍅</span>
            <input
              type="number"
              min={1}
              max={99}
              value={estimate}
              aria-label="Количество помидоров"
              className="h-8 w-12 bg-transparent text-center text-[var(--text)] outline-none"
              onChange={(event) => setEstimate(event.target.value)}
              onBlur={() => setEstimate((value) => String(clampPomodoros(value)))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !title.trim()) event.currentTarget.blur();
              }}
            />
          </label>
          <button type="button" className="rounded-md px-2 py-1 text-lg text-[var(--muted)] hover:bg-white/5" onClick={() => setEstimate((value) => String(Math.min(99, clampPomodoros(value) + 1)))}>
            +
          </button>
        </div>
      </form>

      <ActiveTimer />

      <section className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">Всего осталось • {minutesHuman(totalMinutes)}</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" icon={<FolderPlus className="h-4 w-4" />} onClick={() => setDialog({ type: "createProjectWithTasks", projectName: "", tasks: [emptyProjectTaskDraft()] })}>
            Добавить папку проекта
          </Button>
          {projects.length > 0 && (
            <>
            <Button type="button" onClick={collapseAllProjects}>
              Скрыть папки
            </Button>
            <Button type="button" onClick={expandAllProjects}>
              Раскрыть папки
            </Button>
            </>
          )}
        </div>
      </section>

      {unassigned.length > 0 && (
        <section className="grid gap-2">
          <h2 className="px-1 text-xl font-bold">Без проекта</h2>
          <div className="grid gap-1">
            {unassigned.map((task) => (
              <TaskRow key={task.id} task={task} burning={Boolean(burningTaskIds[task.id])} onComplete={completeTaskWithBurn} onMenu={openTaskMenu} />
            ))}
          </div>
        </section>
      )}

      {openTasks.length === 0 && (
        <div className="grid gap-1">
          <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-[var(--muted)]">Задач пока нет. Напишите задачу сверху и нажмите Enter.</p>
        </div>
      )}

      {projectGroups.map((group) => renderGroup(group.project, group.tasks))}

      {menu && (
        <div
          className="fixed z-50 w-64 rounded-lg border border-[var(--border)] bg-[var(--raised)] p-2 shadow-2xl"
          style={{ left: menu.x, top: menu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {menu.type === "task" && activeMenuTask ? (
            <>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10" onClick={() => {
                setDialog({ type: "rename", task: activeMenuTask, value: activeMenuTask.title });
                setMenu(undefined);
              }}>
                <Pencil className="h-4 w-4 text-[var(--muted)]" />
                Переименовать
              </button>
              <div className="px-3 py-2">
                <p className="mb-2 text-xs text-[var(--muted)]">Оценка в помидорах</p>
                <div className="flex items-center gap-2">
                  <Button onClick={() => void updateTaskEstimateInMenu(activeMenuTask, Math.max(1, menuEstimateBase(activeMenuTask) - 1))}>−</Button>
                  <label className="flex min-w-16 items-center justify-center rounded-lg border border-[var(--border)] bg-black/10 px-2 py-1 focus-within:border-[var(--primary)]">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={menuEstimate}
                      aria-label="Оценка задачи в помидорах"
                      className="h-8 w-12 bg-transparent text-center text-base font-bold text-[var(--text)] outline-none"
                      onChange={(event) => {
                        const next = event.target.value;
                        setMenuEstimate(next);
                        if (next.trim() !== "") void updateTaskEstimateInMenu(activeMenuTask, next);
                      }}
                      onBlur={() => commitMenuEstimate(activeMenuTask)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                  </label>
                  <Button onClick={() => void updateTaskEstimateInMenu(activeMenuTask, menuEstimateBase(activeMenuTask) + 1)}>+</Button>
                </div>
              </div>
              <div className="border-t border-[var(--border)] py-2">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--primary)] hover:bg-white/10" onClick={() => {
                  setDialog({ type: "project", task: activeMenuTask, query: "", newProjectName: "" });
                  setMenu(undefined);
                }}>
                  <FolderPlus className="h-4 w-4" />
                  {activeMenuTask.projectId && activeMenuTask.projectId !== "project_inbox" ? "Сменить проект" : "Добавить в проект"}
                </button>
                {activeMenuTask.projectId && activeMenuTask.projectId !== "project_inbox" && (
                  <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white/10" onClick={() => void changeProject(activeMenuTask, undefined)}>
                    Убрать из проекта
                  </button>
                )}
              </div>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ember-danger hover:bg-ember-danger/10" onClick={() => {
                setDialog({ type: "delete", task: activeMenuTask });
                setMenu(undefined);
              }}>
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            </>
          ) : menu.type === "project" ? (
            <>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--primary)] hover:bg-white/10" onClick={() => {
                setDialog({ type: "createTaskInProject", project: menu.project, tasks: [emptyProjectTaskDraft()] });
                setMenu(undefined);
              }}>
                <Plus className="h-4 w-4" />
                Добавить задачу
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ember-danger hover:bg-ember-danger/10" onClick={() => {
                setDialog({ type: "deleteProject", project: menu.project });
                setMenu(undefined);
              }}>
                <Trash2 className="h-4 w-4" />
                Удалить проект
              </button>
            </>
          ) : null}
        </div>
      )}

      {dialog && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4" onClick={() => setDialog(undefined)}>
          <section
            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            {dialog.type === "delete" ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ember-danger/15 text-ember-danger">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text)]">Удалить задачу?</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Задача «{dialog.task.title}» исчезнет из списка. История уже сохраненных фокус-сессий останется в статистике.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setDialog(undefined)}>Отмена</Button>
                  <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void confirmDeleteTask(dialog.task)}>
                    Удалить
                  </Button>
                </div>
              </>
            ) : dialog.type === "deleteProject" ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ember-danger/15 text-ember-danger">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text)]">Удалить проект?</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Проект «{dialog.project.name}» исчезнет из списка. Задачи останутся и перейдут в «Без проекта».
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setDialog(undefined)}>Отмена</Button>
                  <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void confirmDeleteProject(dialog.project)}>
                    Удалить
                  </Button>
                </div>
              </>
            ) : dialog.type === "createTaskInProject" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void createTaskInProject();
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                    <Plus className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-[var(--text)]">Добавить задачу</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">Проект: {dialog.project.name}</p>
                  </div>
                </div>
                {renderProjectTaskDraftRows()}
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" onClick={() => setDialog(undefined)}>
                    Отмена
                  </Button>
                  <Button type="submit" variant="primary" disabled={!hasTaskDraftTitle}>
                    Добавить
                  </Button>
                </div>
              </form>
            ) : dialog.type === "createProjectWithTasks" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void createProjectWithTasks();
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                    <FolderPlus className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-[var(--text)]">Добавить папку проекта</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">Создайте проект и сразу добавьте в него задачи.</p>
                  </div>
                </div>
                <Input
                  className="mt-5"
                  autoFocus
                  value={dialog.projectName}
                  placeholder="Название проекта"
                  onChange={(event) => setDialog({ ...dialog, projectName: event.target.value })}
                />
                {renderProjectTaskDraftRows()}
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" onClick={() => setDialog(undefined)}>
                    Отмена
                  </Button>
                  <Button type="submit" variant="primary" disabled={!dialog.projectName.trim()}>
                    Создать
                  </Button>
                </div>
              </form>
            ) : dialog.type === "project" ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                    <Folder className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-[var(--text)]">
                      {dialog.task.projectId && dialog.task.projectId !== "project_inbox" ? "Сменить проект" : "Добавить в проект"}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Выберите проект для задачи «{dialog.task.title}» или создайте новый.
                    </p>
                  </div>
                </div>

                <Input
                  className="mt-5"
                  value={dialog.query}
                  placeholder="Найти проект"
                  onChange={(event) => setDialog({ ...dialog, query: event.target.value })}
                />

                <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-[var(--border)] bg-black/10 p-2 scrollbar-thin">
                  <button
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                      !dialog.task.projectId || dialog.task.projectId === "project_inbox" ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "text-[var(--text)]"
                    }`}
                    onClick={() => void assignProjectFromDialog(dialog.task, undefined)}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="min-w-0 flex-1 truncate">Без проекта</span>
                    {(!dialog.task.projectId || dialog.task.projectId === "project_inbox") && <Check className="h-4 w-4" />}
                  </button>

                  {visibleProjects.map((project) => {
                    const isCurrent = dialog.task.projectId === project.id;
                    const isEditing = dialog.editingProjectId === project.id;
                    const taskCount = openTasks.filter((task) => task.projectId === project.id).length;

                    return (
                      <div key={project.id} className="mt-1 rounded-md hover:bg-white/10">
                        {isEditing ? (
                          <form
                            className="flex items-center gap-2 p-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void renameProjectFromDialog();
                            }}
                          >
                            <Input
                              autoFocus
                              value={dialog.editingProjectName ?? project.name}
                              onChange={(event) => setDialog({ ...dialog, editingProjectName: event.target.value })}
                            />
                            <Button type="submit" variant="primary" disabled={!dialog.editingProjectName?.trim()}>
                              OK
                            </Button>
                          </form>
                        ) : (
                          <div className={`flex items-center gap-2 rounded-md px-3 py-2 ${isCurrent ? "bg-[var(--primary)]/15" : ""}`}>
                            <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => void assignProjectFromDialog(dialog.task, project.id)}>
                              <Folder className={`h-4 w-4 shrink-0 ${isCurrent ? "text-[var(--primary)]" : "text-[var(--muted)]"}`} />
                              <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">{project.name}</span>
                              <span className="shrink-0 text-xs text-[var(--muted)]">{taskCount}</span>
                              {isCurrent && <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />}
                            </button>
                            <button
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]"
                              aria-label="Переименовать проект"
                              onClick={() => setDialog({ ...dialog, editingProjectId: project.id, editingProjectName: project.name })}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ember-danger hover:bg-ember-danger/10"
                              aria-label="Удалить проект"
                              onClick={() => setDialog({ ...dialog, deletingProject: project })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {visibleProjects.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-[var(--muted)]">Подходящих проектов нет.</p>
                  )}
                </div>

                <form
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void createProjectForTask(dialog.task);
                  }}
                >
                  <Input
                    value={dialog.newProjectName}
                    placeholder="Новый проект"
                    onChange={(event) => setDialog({ ...dialog, newProjectName: event.target.value })}
                  />
                  <Button type="submit" variant="primary" icon={<FolderPlus className="h-4 w-4" />} disabled={!dialog.newProjectName.trim()}>
                    Создать
                  </Button>
                </form>

                {dialog.deletingProject && (
                  <div className="mt-4 rounded-lg border border-ember-danger/35 bg-ember-danger/10 p-3">
                    <p className="text-sm font-semibold text-[var(--text)]">Удалить проект «{dialog.deletingProject.name}»?</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Задачи останутся, но перейдут в раздел «Без проекта».</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button type="button" onClick={() => setDialog({ ...dialog, deletingProject: undefined })}>
                        Отмена
                      </Button>
                      <Button type="button" variant="danger" onClick={() => void deleteProjectFromDialog()}>
                        Удалить проект
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (dialog.type === "rename") void renameTask(dialog.task);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                    <Pencil className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-[var(--text)]">Переименовать задачу</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Новое название сразу появится в списке задач.
                    </p>
                  </div>
                </div>
                <Input
                  className="mt-5"
                  autoFocus
                  value={dialog.value}
                  placeholder="Название задачи"
                  onChange={(event) => setDialog({ ...dialog, value: event.target.value })}
                />
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" onClick={() => setDialog(undefined)}>
                    Отмена
                  </Button>
                  <Button type="submit" variant="primary" disabled={!dialog.value.trim()}>
                    Сохранить
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      <CompletionPrompt />
    </div>
  );
}
