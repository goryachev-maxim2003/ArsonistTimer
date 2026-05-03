import { useEffect } from "react";
import { Flame } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useTheme } from "../hooks/useTheme";
import { useTimerEngine } from "../hooks/useTimerEngine";
import { useI18n } from "../hooks/useI18n";
import { useDomTranslation } from "../hooks/useDomTranslation";
import { AppLayout } from "../components/layout/AppLayout";
import { TasksPage } from "../pages/TasksPage";
import { StatsPage } from "../pages/StatsPage";
import { ForecastPage } from "../pages/ForecastPage";
import { UpdatesPage } from "../pages/UpdatesPage";
import { SettingsPage } from "../pages/SettingsPage";
import { UpdatePrompt } from "../components/updates/UpdatePrompt";

const pages = {
  tasks: TasksPage,
  stats: StatsPage,
  forecast: ForecastPage,
  updates: UpdatesPage,
  settings: SettingsPage,
};

export default function App() {
  const hydrate = useAppStore((state) => state.hydrate);
  const hydrated = useAppStore((state) => state.hydrated);
  const route = useAppStore((state) => state.route);
  useTheme();
  useTimerEngine();
  useDomTranslation();
  const { t } = useI18n();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--text)]">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-[var(--primary)] text-black shadow-ember">
            <Flame className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-semibold">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const Page = pages[route as keyof typeof pages] ?? TasksPage;

  return (
    <AppLayout>
      <Page />
      <UpdatePrompt />
    </AppLayout>
  );
}
