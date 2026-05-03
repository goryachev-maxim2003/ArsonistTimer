import { useAppStore } from "../store/appStore";
import { translateText } from "../i18n/text";

const dictionary = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.tasks": "Tasks",
    "nav.focus": "Focus",
    "nav.projects": "Projects",
    "nav.calendar": "Calendar",
    "nav.stats": "Stats",
    "nav.history": "History",
    "nav.guide": "Guide",
    "nav.forecast": "Forecast",
    "nav.updates": "Updates",
    "nav.settings": "Settings",
    "header.add": "Add",
    "header.focus": "Focus",
    "header.command": "Ctrl K",
    "settings.language": "Language",
    "settings.english": "English",
    "settings.russian": "Russian",
    "common.loading": "Loading ArsonistTimer",
  },
  ru: {
    "nav.dashboard": "Дашборд",
    "nav.tasks": "Задачи",
    "nav.focus": "Фокус",
    "nav.projects": "Проекты",
    "nav.calendar": "Календарь",
    "nav.stats": "Статистика",
    "nav.history": "История",
    "nav.guide": "Инструкция",
    "nav.forecast": "Прогноз",
    "nav.updates": "Обновления",
    "nav.settings": "Настройки",
    "header.add": "Добавить",
    "header.focus": "Фокус",
    "header.command": "Ctrl K",
    "settings.language": "Язык",
    "settings.english": "Английский",
    "settings.russian": "Русский",
    "common.loading": "Загрузка ArsonistTimer",
  },
} as const;

export type I18nKey = keyof typeof dictionary.en;

export function useI18n() {
  const language = useAppStore((state) => state.settings.language);

  return {
    language,
    t: (key: I18nKey) => dictionary[language][key] ?? dictionary.en[key],
    text: (value: string) => translateText(value, language),
  };
}
