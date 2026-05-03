import { useEffect, useState } from "react";
import { CheckCircle2, Download, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { type UpdateStatus } from "../types/updates";

function statusText(status?: UpdateStatus) {
  if (!window.arsonistDesktop?.updates) return "Обновления доступны только в настольной версии приложения.";
  if (!status) return "Статус обновлений загружается.";
  if (status.state === "checking") return "Проверяем обновления.";
  if (status.state === "available") return `Доступна версия ${status.availableVersion}.`;
  if (status.state === "downloading") return `Загружаем обновление: ${Math.round(status.progress?.percent ?? 0)}%.`;
  if (status.state === "downloaded") return "Обновление скачано и готово к установке.";
  if (status.state === "none") return "Установлена последняя версия.";
  if (status.state === "unsupported") return "Проверка обновлений доступна только в установленной версии приложения.";
  if (status.state === "error") return "Не удалось проверить обновления.";
  return "Можно проверить обновления вручную.";
}

function releaseNotes(status?: UpdateStatus) {
  const notes = status?.releaseNotes?.trim();
  if (!notes) return "Описание изменений появится здесь, когда оно будет добавлено в релизе GitHub.";
  return notes;
}

export function UpdatesPage() {
  const [status, setStatus] = useState<UpdateStatus | undefined>();
  const updates = window.arsonistDesktop?.updates;
  const checking = status?.state === "checking";
  const downloading = status?.state === "downloading";
  const downloaded = status?.state === "downloaded";
  const available = status?.state === "available";

  useEffect(() => {
    if (!updates) return undefined;
    let mounted = true;
    updates.getStatus().then((next) => mounted && setStatus(next)).catch(() => undefined);
    const unsubscribe = updates.onStatus((next) => setStatus(next));
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [updates]);

  return (
    <div className="grid gap-5">
      <Card title="Обновления" eyebrow="ArsonistTimer">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">Текущая версия</p>
            <p className="mt-1 text-3xl font-bold">{status?.currentVersion ?? "2.0.0"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              icon={<RefreshCw className="h-4 w-4" />}
              loading={checking}
              onClick={() => void updates?.check().then(setStatus)}
              disabled={!updates || downloading}
            >
              Проверить
            </Button>
            {(available || downloading) && (
              <Button
                type="button"
                variant="primary"
                icon={<Download className="h-4 w-4" />}
                loading={downloading}
                onClick={() => void updates?.download().then(setStatus)}
              >
                Скачать
              </Button>
            )}
            {downloaded && (
              <Button type="button" variant="primary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => void updates?.install()}>
                Установить
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[var(--border)] bg-black/10 p-4">
          <div className="flex items-start gap-3">
            {status?.state === "error" ? <TriangleAlert className="mt-0.5 h-5 w-5 text-ember-danger" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--primary)]" />}
            <div>
              <p className="font-semibold text-[var(--text)]">{statusText(status)}</p>
              {status?.error && <p className="mt-1 text-sm text-ember-danger">{status.error}</p>}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Что добавлено в обновлении" eyebrow={status?.availableVersion ? `Версия ${status.availableVersion}` : "Описание релиза"}>
        <p className="whitespace-pre-line text-sm text-[var(--muted)]">{releaseNotes(status)}</p>
      </Card>

      <Card title="Сохранность данных" eyebrow="Локальная база">
        <p className="text-sm text-[var(--muted)]">
          Обновление заменяет файлы приложения, но не удаляет локальную базу IndexedDB. Задачи, проекты, статистика, история фокуса и настройки остаются в профиле ArsonistTimer.
        </p>
      </Card>
    </div>
  );
}
