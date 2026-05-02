import { useState } from "react";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { minutesToHuman } from "../utils/formatting";

const swatches = ["#FF6A00", "#FFC857", "#3DDC84", "#5DADEC", "#B794F4", "#FF6B8A"];

export function ProjectsPage() {
  const projects = useAppStore((state) => state.projects);
  const tasks = useAppStore((state) => state.tasks);
  const stats = useAppStore((state) => state.stats);
  const createProject = useAppStore((state) => state.createProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const archiveProject = useAppStore((state) => state.archiveProject);
  const deleteProject = useAppStore((state) => state.deleteProject);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(swatches[0]);

  const reset = () => {
    setEditingId(undefined);
    setName("");
    setDescription("");
    setColor(swatches[0]);
  };

  const save = async () => {
    if (editingId) {
      await updateProject(editingId, { name, description, color });
    } else {
      await createProject({ name, description, color });
    }
    reset();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
      <Card title={editingId ? "Edit Project" : "Create Project"} eyebrow="Organize">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="University" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Description
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What belongs here?" />
          </label>
          <div>
            <p className="mb-2 text-sm font-semibold">Color</p>
            <div className="flex flex-wrap gap-2">
              {swatches.map((item) => (
                <button
                  key={item}
                  aria-label={`Use ${item}`}
                  className={`h-9 w-9 rounded-lg border ${color === item ? "border-white" : "border-transparent"}`}
                  style={{ background: item }}
                  onClick={() => setColor(item)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => void save()}>
              Save
            </Button>
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Projects" eyebrow="Portfolio">
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const focusMinutes = stats.reduce((sum, item) => sum + (item.projectBreakdown[project.id] ?? 0), 0);
            return (
              <article key={project.id} className={`raised rounded-lg p-4 ${project.archived ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="mb-3 block h-3 w-16 rounded-full" style={{ background: project.color }} />
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    {project.description && <p className="mt-1 text-sm text-[var(--muted)]">{project.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      icon={<Pencil className="h-4 w-4" />}
                      aria-label="Edit project"
                      onClick={() => {
                        setEditingId(project.id);
                        setName(project.name);
                        setDescription(project.description ?? "");
                        setColor(project.color);
                      }}
                    />
                    <Button variant="ghost" icon={<Archive className="h-4 w-4" />} aria-label="Archive project" onClick={() => void archiveProject(project.id)} />
                    <Button
                      variant="ghost"
                      icon={<Trash2 className="h-4 w-4" />}
                      aria-label="Delete project"
                      onClick={() => {
                        if (window.confirm("Delete this project?")) void deleteProject(project.id);
                      }}
                    />
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-[var(--muted)]">Tasks</dt>
                    <dd className="font-semibold">{projectTasks.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Open</dt>
                    <dd className="font-semibold">{projectTasks.filter((task) => task.status !== "completed" && task.status !== "archived").length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Focus</dt>
                    <dd className="font-semibold">{minutesToHuman(focusMinutes)}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
          {projects.length === 0 && <EmptyState title="No projects yet.">Create a project to organize your focus.</EmptyState>}
        </div>
      </Card>
    </div>
  );
}
