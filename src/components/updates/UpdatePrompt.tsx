import { useEffect, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";
import { type UpdateStatus } from "../../types/updates";

const IGNORED_UPDATE_KEY = "arsonist_ignored_update_version";

function shouldShowPrompt(status?: UpdateStatus) {
  if (!status) return false;
  if (status.state !== "available" && status.state !== "downloading" && status.state !== "downloaded") return false;
  if (!status.availableVersion) return true;
  return localStorage.getItem(IGNORED_UPDATE_KEY) !== status.availableVersion;
}

export function UpdatePrompt() {
  const [status, setStatus] = useState<UpdateStatus | undefined>();
  const [visible, setVisible] = useState(false);
  const [ignoreVersion, setIgnoreVersion] = useState(false);

  useEffect(() => {
    const updates = window.arsonistDesktop?.updates;
    if (!updates) return undefined;

    let mounted = true;
    const applyStatus = (next: UpdateStatus) => {
      if (!mounted) return;
      setStatus(next);
      if (shouldShowPrompt(next)) setVisible(true);
    };

    updates.getStatus().then(applyStatus).catch(() => undefined);
    const unsubscribe = updates.onStatus(applyStatus);
    const timer = window.setTimeout(() => {
      updates.check().then(applyStatus).catch(() => undefined);
    }, 2500);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (!visible || !status) return null;

  const version = status.availableVersion ?? "новая версия";
  const downloading = status.state === "downloading";
  const downloaded = status.state === "downloaded";
  const progress = Math.round(status.progress?.percent ?? 0);

  const close = () => {
    if (ignoreVersion && status.availableVersion) {
      localStorage.setItem(IGNORED_UPDATE_KEY, status.availableVersion);
    }
    setVisible(false);
  };

  const updateNow = () => {
    if (downloaded) {
      void window.arsonistDesktop?.updates?.install();
      return;
    }
    void window.arsonistDesktop?.updates?.download();
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4">
      <section className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Обновление</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">{downloaded ? "Обновление скачано" : "Доступна новая версия"}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {downloaded ? "Можно перезапустить приложение и установить обновление." : `Версия ${version} доступна для установки.`}
        </p>
        {!downloaded && <p className="mt-2 text-sm font-semibold text-[var(--text)]">Обновить сейчас?</p>}
        {downloading && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">Загрузка: {progress}%</p>
          </div>
        )}
        {!downloaded && (
          <label className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
            <input className="h-4 w-4 accent-[var(--primary)]" type="checkbox" checked={ignoreVersion} onChange={(event) => setIgnoreVersion(event.target.checked)} />
            Не напоминать об этой версии
          </label>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button type="button" onClick={close}>
            Позже
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={downloaded ? <RotateCcw className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            loading={downloading}
            onClick={updateNow}
          >
            {downloaded ? "Установить" : "Обновить"}
          </Button>
        </div>
      </section>
    </div>
  );
}
