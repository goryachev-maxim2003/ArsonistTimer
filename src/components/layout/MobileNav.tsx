import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";
import { navItems } from "./navItems";

const mobileRoutes = navItems;

export function MobileNav() {
  const route = useAppStore((state) => state.route);
  const setRoute = useAppStore((state) => state.setRoute);
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 px-2 py-2 backdrop-blur xl:hidden" aria-label="Mobile navigation">
      <div className="grid grid-cols-5 gap-1">
        {mobileRoutes.map((item) => {
          const Icon = item.icon;
          const active = route === item.route;
          const label = t(item.labelKey);
          return (
            <button
              key={item.route}
              onClick={() => setRoute(item.route)}
              className={`grid min-h-14 place-items-center rounded-lg text-xs font-semibold transition ${
                active ? "bg-[var(--primary)] text-black" : "text-[var(--muted)] hover:bg-white/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
