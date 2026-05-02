import { Flame, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";
import { Button } from "../ui/Button";
import { navItems } from "./navItems";

export function Sidebar() {
  const route = useAppStore((state) => state.route);
  const setRoute = useAppStore((state) => state.setRoute);
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const { t } = useI18n();

  return (
    <aside className={`sticky top-0 hidden h-screen shrink-0 border-r border-[var(--border)] bg-black/20 backdrop-blur xl:block ${collapsed ? "w-24 p-3" : "w-72 p-4"}`}>
      <div className={`mb-8 flex gap-3 ${collapsed ? "flex-col items-center" : "items-center justify-between"}`}>
        <button
          className={`flex min-w-0 items-center gap-3 text-left ${collapsed ? "justify-center" : ""}`}
          onClick={() => setRoute("tasks")}
          aria-label="Open dashboard"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--primary)] text-black shadow-ember">
            <Flame className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span>
              <span className="block text-lg font-bold">ArsonistTimer</span>
              <span className="block text-xs text-[var(--muted)]">Фокус и задачи</span>
            </span>
          )}
        </button>
        {!collapsed && <Button variant="ghost" icon={<PanelLeftClose className="h-4 w-4" />} aria-label="Collapse sidebar" onClick={toggleSidebar} />}
        {collapsed && (
          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--text)]"
            aria-label="Expand sidebar"
            onClick={toggleSidebar}
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="space-y-2" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = route === item.route;
          const label = t(item.labelKey);
          return (
            <button
              key={item.route}
              onClick={() => setRoute(item.route)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                active ? "bg-[var(--primary)] text-black" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]"
              } ${collapsed ? "justify-center" : ""}`}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
