import { useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { secondsToClock } from "../utils/formatting";

export function useTimerEngine() {
  const tickTimer = useAppStore((state) => state.tickTimer);
  const timer = useAppStore((state) => state.timer);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    const interval = window.setInterval(tickTimer, 500);
    const onVisibility = () => tickTimer();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, [tickTimer]);

  useEffect(() => {
    if (!settings.timer.showTimerInTitle) {
      document.title = "ArsonistTimer";
      return;
    }

    if (timer.status === "running" || timer.status === "paused") {
      document.title = `${secondsToClock(timer.remainingSeconds)} - ArsonistTimer`;
      return;
    }

    document.title = "ArsonistTimer";
  }, [settings.timer.showTimerInTitle, timer.remainingSeconds, timer.status]);
}
