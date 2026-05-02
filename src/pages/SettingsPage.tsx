import { useEffect, useState, type KeyboardEvent } from "react";
import { Flame, Volume2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { useAppStore } from "../store/appStore";
import type { BrandTone, ThemeName } from "../types/models";

const accentPresets = [
  { name: "Огонь", value: "#FF6A00" },
  { name: "Янтарь", value: "#FFC857" },
  { name: "Томат", value: "#D7332F" },
  { name: "Мята", value: "#3DDC84" },
  { name: "Небо", value: "#5DADEC" },
  { name: "Лаванда", value: "#B794F4" },
];

function clampNumber(value: string, min = 1, max = Number.POSITIVE_INFINITY) {
  const parsed = Number(value);
  if (!value.trim() || !Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function SoftNumberInput({
  value,
  min = 1,
  max,
  onCommit,
}: {
  value: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const next = clampNumber(draft, min, max);
    setDraft(String(next));
    if (next !== value) onCommit(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  return <Input type="number" min={min} max={max} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={handleKeyDown} />;
}

export function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const updateTimerSettings = useAppStore((state) => state.updateTimerSettings);
  const updateAppearanceSettings = useAppStore((state) => state.updateAppearanceSettings);
  const updateDailyGoalSettings = useAppStore((state) => state.updateDailyGoalSettings);
  const updateSoundSettings = useAppStore((state) => state.updateSoundSettings);
  const testSound = useAppStore((state) => state.testSound);
  const testTaskBurnSound = useAppStore((state) => state.testTaskBurnSound);
  const autoMode = settings.timer.autoStartBreaks && settings.timer.autoStartNextFocus;

  const setAutoMode = (enabled: boolean) => {
    void updateTimerSettings({
      autoStartBreaks: enabled,
      autoStartNextFocus: enabled,
      allowManualCompletion: true,
      savePartialSessions: true,
      showTimerInTitle: true,
    });
  };

  return (
    <div className="grid gap-5">
      <section className="grid gap-5 xl:grid-cols-2">
        <Card title="Таймер" eyebrow="Помидоры">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Фокус, минут
              <SoftNumberInput value={settings.timer.focusMinutes} onCommit={(focusMinutes) => void updateTimerSettings({ focusMinutes })} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Короткий перерыв, минут
              <SoftNumberInput value={settings.timer.shortBreakMinutes} onCommit={(shortBreakMinutes) => void updateTimerSettings({ shortBreakMinutes })} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Длинный перерыв, минут
              <SoftNumberInput value={settings.timer.longBreakMinutes} onCommit={(longBreakMinutes) => void updateTimerSettings({ longBreakMinutes })} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Длинный перерыв после
              <SoftNumberInput value={settings.timer.longBreakInterval} onCommit={(longBreakInterval) => void updateTimerSettings({ longBreakInterval })} />
            </label>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Запуск следующего таймера</p>
            <div className="grid grid-cols-2 rounded-lg border border-[var(--border)] bg-black/20 p-1">
              <button className={`rounded-md px-3 py-2 text-sm font-semibold ${!autoMode ? "bg-[var(--primary)] text-black" : "text-[var(--muted)]"}`} onClick={() => setAutoMode(false)}>
                Ручной
              </button>
              <button className={`rounded-md px-3 py-2 text-sm font-semibold ${autoMode ? "bg-[var(--primary)] text-black" : "text-[var(--muted)]"}`} onClick={() => setAutoMode(true)}>
                Автоматический
              </button>
            </div>
          </div>
        </Card>

        <Card title="Внешний вид" eyebrow="Темы">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Тема
              <Select value={settings.appearance.theme} onChange={(event) => void updateAppearanceSettings({ theme: event.target.value as ThemeName })}>
                <option value="dark-ember">Темный уголек</option>
                <option value="charcoal">Угольный</option>
                <option value="midnight">Полночь</option>
                <option value="ash-light">Светлый пепел</option>
                <option value="forest-focus">Лесной фокус</option>
                <option value="deep-ocean">Глубокий океан</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Тон кнопок
              <Select value={settings.appearance.brandTone} onChange={(event) => void updateAppearanceSettings({ brandTone: event.target.value as BrandTone })}>
                <option value="arsonist">Огненный</option>
                <option value="neutral">Нейтральный</option>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Акцентный цвет
              <Input type="color" value={settings.appearance.accentColor} onChange={(event) => void updateAppearanceSettings({ accentColor: event.target.value })} />
            </label>
            <div className="grid gap-2 text-sm font-semibold">
              Рекомендованные цвета
              <div className="flex flex-wrap gap-2">
                {accentPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`grid h-10 w-10 place-items-center rounded-lg border transition hover:scale-105 ${
                      settings.appearance.accentColor.toLowerCase() === preset.value.toLowerCase() ? "border-[var(--text)]" : "border-[var(--border)]"
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                    aria-label={preset.name}
                    onClick={() => void updateAppearanceSettings({ accentColor: preset.value })}
                  >
                    {settings.appearance.accentColor.toLowerCase() === preset.value.toLowerCase() && <span className="h-2 w-2 rounded-full bg-black/70" />}
                  </button>
                ))}
              </div>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Плотность
              <Select value={settings.appearance.compactMode ? "compact" : "normal"} onChange={(event) => void updateAppearanceSettings({ compactMode: event.target.value === "compact" })}>
                <option value="normal">Обычная</option>
                <option value="compact">Компактная</option>
              </Select>
            </label>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card title="Дневная цель" eyebrow="План">
          <label className="grid gap-2 text-sm font-semibold">
            Помидоров в день
            <SoftNumberInput
              value={settings.dailyGoal.target}
              onCommit={(target) =>
                void updateDailyGoalSettings({
                  type: "pomodoro_count",
                  target,
                  workDaysPerWeek: settings.dailyGoal.workDaysPerWeek,
                  graceMode: true,
                })
              }
            />
          </label>
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Дней занятий в неделю</p>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, index) => index + 1).map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`rounded-lg border px-2 py-2 text-sm font-bold transition ${
                    settings.dailyGoal.workDaysPerWeek === days ? "border-[var(--primary)] bg-[var(--primary)] text-black" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]"
                  }`}
                  onClick={() => void updateDailyGoalSettings({ workDaysPerWeek: days })}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Эта цель используется в прогнозе выполнения всех открытых задач.</p>
        </Card>

        <Card title="Звук" eyebrow="Окончание таймера">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Громкость: {settings.sounds.volume}%
              <Input type="range" min={0} max={100} value={settings.sounds.volume} onChange={(event) => void updateSoundSettings({ enabled: true, timerComplete: true, volume: Number(event.target.value) })} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Мелодия
              <Select value={settings.sounds.melody} onChange={(event) => void updateSoundSettings({ enabled: true, timerComplete: true, melody: event.target.value as typeof settings.sounds.melody })}>
                <option value="ember_chime">Угольный звон</option>
                <option value="digital_bell">Цифровой звонок</option>
                <option value="arcade_spark">Аркадная искра</option>
                <option value="calm_gong">Спокойный гонг</option>
                <option value="soft_pulse">Мягкий импульс</option>
                <option value="timer_bell">Таймерный звонок</option>
                <option value="warm_fire">Теплый огонь</option>
                <option value="quiet_alarm">Тихий будильник</option>
              </Select>
            </label>
            <Button icon={<Volume2 className="h-4 w-4" />} onClick={testSound}>
              Проверить таймер
            </Button>
            <label className="grid gap-2 text-sm font-semibold">
              Сгорание задачи: {settings.sounds.burnVolume}%
              <Input type="range" min={0} max={100} value={settings.sounds.burnVolume} onChange={(event) => void updateSoundSettings({ enabled: true, taskComplete: true, burnVolume: Number(event.target.value) })} />
            </label>
            <Button icon={<Flame className="h-4 w-4" />} onClick={testTaskBurnSound}>
              Проверить сгорание
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
