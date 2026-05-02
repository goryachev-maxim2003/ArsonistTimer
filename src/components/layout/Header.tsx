import { Flame } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAppStore } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";

export function Header() {
  const route = useAppStore((state) => state.route);
  const { t } = useI18n();
  const routeTitleKey = `nav.${route}` as const;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 xl:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-black">
              <Flame className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">Arsonist</span>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-[var(--muted)] sm:block">{format(new Date(), "EEEE, d MMMM", { locale: ru })}</p>
          <h1 className="truncate text-xl font-bold sm:text-2xl">{t(routeTitleKey)}</h1>
        </div>
      </div>
    </header>
  );
}
