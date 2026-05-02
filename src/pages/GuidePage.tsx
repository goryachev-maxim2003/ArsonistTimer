import { BarChart3, BookOpen, CalendarDays, Database, Flame, Gauge, History, Keyboard, ListChecks, Settings, Target } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useI18n } from "../hooks/useI18n";

const guide = {
  en: {
    title: "Arsonist Guide",
    subtitle: "A page-by-page reference for every window, button, and main workflow.",
    sidebar: {
      title: "Sidebar And Header",
      icon: BookOpen,
      bullets: [
        "Sidebar icons open the main windows: Dashboard, Tasks, Focus, Projects, Calendar, Stats, History, Guide, and Settings.",
        "The flame logo opens Dashboard. The sidebar toggle collapses or expands the menu.",
        "Header Add opens the command bar. Header Focus opens a focus session quickly.",
        "Ctrl K opens the command bar from anywhere.",
      ],
    },
    sections: [
      {
        title: "Dashboard",
        icon: Gauge,
        bullets: [
          "Shows today's overview: daily goal, active timer, today's tasks, streak, overdue warning, suggested next task, and weekly focus preview.",
          "Open Focus goes to the timer window.",
          "Quick Add creates a task from one line.",
          "All tasks opens the full task manager.",
          "Review appears when overdue tasks exist and opens Tasks.",
        ],
      },
      {
        title: "Tasks",
        icon: ListChecks,
        bullets: [
          "Create, edit, duplicate, archive, delete, complete, filter, and search tasks.",
          "New task opens the task editor.",
          "Task flame button starts focus for that task.",
          "Check button completes the task. Pencil edits it. Copy duplicates it. Archive moves it to archive. Trash deletes after confirmation.",
          "Filters control view, sorting, project, tag, and search text.",
        ],
      },
      {
        title: "Focus",
        icon: Flame,
        bullets: [
          "Runs focus, short break, and long break timers.",
          "Ignite Focus / Start Focus starts the timer. Pause pauses it. Resume continues it.",
          "Extinguish / Stop stops the session and saves partial or cancelled history depending on progress.",
          "Burn Complete / Complete saves the session immediately.",
          "Skip switches mode. Reset returns the current timer to its full duration.",
          "The timer uses plannedEndAt, so it stays accurate after inactivity.",
        ],
      },
      {
        title: "Projects",
        icon: Target,
        bullets: [
          "Create projects, edit name/description/color, archive or delete projects.",
          "Save creates or updates the current project form.",
          "Clear resets the project form.",
          "Project cards show total tasks, open tasks, and focus time.",
        ],
      },
      {
        title: "Calendar",
        icon: CalendarDays,
        bullets: [
          "Shows a month grid with tasks, completed count, and focus minutes per day.",
          "Arrow buttons move to previous or next month.",
          "Click a day to open its day panel.",
          "New creates a task for selected date. Quick Add also creates a task on that date.",
        ],
      },
      {
        title: "Stats",
        icon: BarChart3,
        bullets: [
          "Shows focus time, tasks, streak, completion rate, project breakdown, trends, heatmap, and session quality.",
          "Filters change range, project, and tag.",
          "Charts include daily focus, project pie chart, focus by hour, focus by weekday, cumulative focus, session statuses, estimate vs done, and task completion trend.",
        ],
      },
      {
        title: "History",
        icon: History,
        bullets: [
          "Shows every saved focus session.",
          "Status filter shows all, completed, partial, or cancelled sessions.",
          "Project filter narrows sessions by project.",
          "Export CSV downloads visible history. Trash deletes an incorrect session after confirmation.",
        ],
      },
      {
        title: "Settings",
        icon: Settings,
        bullets: [
          "Timer Settings change focus/break durations, long break interval, auto-start options, partial sessions, and title timer.",
          "Appearance changes language, theme, brand tone, accent color, compact mode, and reduced motion.",
          "Sounds enable or disable sounds, adjust volume, choose timer melody, and test the selected melody.",
          "Data exports/imports JSON, exports Markdown reports, and resets the app after confirmation.",
          "Local Database shows IndexedDB name, storage usage, and record counts.",
          "AI Settings stores optional local endpoint settings; AI is disabled until enabled.",
        ],
      },
      {
        title: "Local Data And Shortcuts",
        icon: Database,
        bullets: [
          "All main data is stored locally in IndexedDB: tasks, projects, tags, focus history, statistics, settings, and streaks.",
          "Space starts or pauses the timer on Focus.",
          "D opens Dashboard, T opens Tasks, F opens Focus, S opens Stats.",
        ],
      },
    ],
  },
  ru: {
    title: "Инструкция Arsonist",
    subtitle: "Справочник по каждому окну, кнопкам и основным действиям.",
    sidebar: {
      title: "Боковая панель и верхняя панель",
      icon: BookOpen,
      bullets: [
        "Иконки боковой панели открывают основные окна: Дашборд, Задачи, Фокус, Проекты, Календарь, Статистика, История, Инструкция и Настройки.",
        "Логотип с пламенем открывает Дашборд. Кнопка сворачивания делает меню компактным или разворачивает его обратно.",
        "Кнопка Добавить вверху открывает командную панель. Кнопка Фокус быстро открывает запуск фокус-сессии.",
        "Ctrl K открывает командную панель из любого окна.",
      ],
    },
    sections: [
      {
        title: "Дашборд",
        icon: Gauge,
        bullets: [
          "Показывает обзор дня: дневную цель, активный таймер, задачи на сегодня, серию, просроченные задачи, следующую рекомендуемую задачу и недельный график фокуса.",
          "Кнопка Открыть фокус открывает окно таймера.",
          "Быстрое добавление создает задачу из одной строки.",
          "Кнопка Все задачи открывает полный список задач.",
          "Кнопка Разобрать появляется, если есть просроченные задачи, и открывает окно Задачи.",
        ],
      },
      {
        title: "Задачи",
        icon: ListChecks,
        bullets: [
          "Здесь можно создавать, редактировать, дублировать, архивировать, удалять, завершать, фильтровать и искать задачи.",
          "Кнопка Новая задача открывает редактор задачи.",
          "Кнопка с пламенем на карточке запускает фокус по этой задаче.",
          "Галочка завершает задачу. Карандаш редактирует. Копия дублирует. Архив переносит в архив. Корзина удаляет после подтверждения.",
          "Фильтры управляют видом, сортировкой, проектом, тегом и поиском.",
        ],
      },
      {
        title: "Фокус",
        icon: Flame,
        bullets: [
          "Окно запускает фокус, короткий перерыв и длинный перерыв.",
          "Разжечь фокус / Начать фокус запускает таймер. Пауза ставит на паузу. Продолжить возобновляет отсчет.",
          "Остановить останавливает сессию и сохраняет ее как частичную или отмененную в зависимости от прогресса.",
          "Завершить сразу сохраняет сессию как завершенную.",
          "Пропустить переключает режим. Сбросить возвращает текущий таймер к полной длительности.",
          "Таймер считает по plannedEndAt, поэтому остается точным после бездействия приложения.",
        ],
      },
      {
        title: "Проекты",
        icon: Target,
        bullets: [
          "Здесь создаются проекты, меняются название, описание и цвет, а также выполняется архивирование или удаление.",
          "Кнопка Сохранить создает или обновляет проект из формы.",
          "Кнопка Сбросить очищает форму проекта.",
          "Карточки проектов показывают всего задач, открытые задачи и накопленное время фокуса.",
        ],
      },
      {
        title: "Календарь",
        icon: CalendarDays,
        bullets: [
          "Показывает месяц: задачи, число выполненных задач и минуты фокуса по каждому дню.",
          "Стрелки переключают предыдущий и следующий месяц.",
          "Клик по дню открывает панель выбранного дня.",
          "Кнопка Создать создает задачу на выбранную дату. Быстрое добавление тоже создает задачу на этот день.",
        ],
      },
      {
        title: "Статистика",
        icon: BarChart3,
        bullets: [
          "Показывает время фокуса, задачи, серию, процент выполнения, разбивку по проектам, тренды, тепловую карту и качество сессий.",
          "Фильтры меняют период, проект и тег.",
          "Графики: фокус по дням, проекты, фокус по часам, фокус по дням недели, накопленный фокус, статусы сессий, оценка против факта и динамика задач.",
        ],
      },
      {
        title: "История",
        icon: History,
        bullets: [
          "Показывает все сохраненные фокус-сессии.",
          "Фильтр статуса показывает все, завершенные, частичные или отмененные сессии.",
          "Фильтр проекта оставляет сессии только выбранного проекта.",
          "Кнопка Export CSV скачивает видимую историю. Корзина удаляет ошибочную сессию после подтверждения.",
        ],
      },
      {
        title: "Настройки",
        icon: Settings,
        bullets: [
          "Timer Settings меняет длительность фокуса и перерывов, интервал длинного перерыва, автозапуск, частичные сессии и таймер в заголовке.",
          "Appearance меняет язык, тему, тон бренда, акцентный цвет, компактный режим и уменьшение анимаций.",
          "Sounds включает звуки, регулирует громкость, выбирает мелодию окончания таймера и запускает проверку звука.",
          "Data экспортирует/импортирует JSON, создает Markdown-отчеты и сбрасывает приложение после подтверждения.",
          "Local Database показывает имя IndexedDB, занятое место и количество записей.",
          "AI Settings хранит настройки опционального локального endpoint; AI выключен, пока вы его не включите.",
        ],
      },
      {
        title: "Локальные данные и горячие клавиши",
        icon: Database,
        bullets: [
          "Все основные данные хранятся локально в IndexedDB: задачи, проекты, теги, история фокуса, статистика, настройки и серия.",
          "Space запускает или ставит таймер на паузу в окне Фокус.",
          "D открывает Дашборд, T открывает Задачи, F открывает Фокус, S открывает Статистику.",
        ],
      },
    ],
  },
};

export function GuidePage() {
  const { language } = useI18n();
  const content = guide[language];
  const sections = [content.sidebar, ...content.sections];

  return (
    <div className="grid gap-5">
      <Card className="glow">
        <Badge tone="primary">{language === "ru" ? "Инструкция" : "Guide"}</Badge>
        <h2 className="mt-3 text-3xl font-bold">{content.title}</h2>
        <p className="mt-2 max-w-3xl text-[var(--muted)]">{content.subtitle}</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} title={section.title} action={<Icon className="h-5 w-5 text-[var(--primary)]" />}>
              <ul className="grid gap-3 text-sm text-[var(--muted)]">
                {section.bullets.map((item) => (
                  <li key={item} className="rounded-lg border border-[var(--border)] bg-black/10 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card title={language === "ru" ? "Командная панель" : "Command Bar"} action={<Keyboard className="h-5 w-5 text-[var(--primary)]" />}>
        <p className="text-sm text-[var(--muted)]">
          {language === "ru"
            ? "Командная панель открывается через Ctrl K или кнопку Добавить. В поле можно быстро создать задачу, а ниже выбрать действие: начать фокус, открыть сегодня, статистику, настройки или экспортировать данные."
            : "The command bar opens with Ctrl K or the Add button. Use the input to create a quick task, or choose an action below: start focus, open today, open stats, open settings, or export data."}
        </p>
      </Card>
    </div>
  );
}
