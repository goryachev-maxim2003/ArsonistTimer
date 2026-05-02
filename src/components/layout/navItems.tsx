import {
  BarChart3,
  CalendarClock,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { AppRoute } from "../../types/models";
import type { I18nKey } from "../../hooks/useI18n";

export const navItems: Array<{ route: AppRoute; labelKey: I18nKey; icon: LucideIcon }> = [
  { route: "tasks", labelKey: "nav.tasks", icon: ListChecks },
  { route: "stats", labelKey: "nav.stats", icon: BarChart3 },
  { route: "forecast", labelKey: "nav.forecast", icon: CalendarClock },
  { route: "settings", labelKey: "nav.settings", icon: Settings },
];
