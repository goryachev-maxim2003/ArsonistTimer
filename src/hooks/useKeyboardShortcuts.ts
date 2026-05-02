import { useEffect } from "react";
import { useAppStore } from "../store/appStore";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

export function useKeyboardShortcuts() {
  const setRoute = useAppStore((state) => state.setRoute);
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);
  const route = useAppStore((state) => state.route);
  const timer = useAppStore((state) => state.timer);
  const startTimer = useAppStore((state) => state.startTimer);
  const pauseTimer = useAppStore((state) => state.pauseTimer);
  const resumeTimer = useAppStore((state) => state.resumeTimer);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
        return;
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === " " && route === "focus") {
        event.preventDefault();
        if (timer.status === "running") pauseTimer();
        else if (timer.status === "paused") resumeTimer();
        else void startTimer("focus");
      }

      const key = event.key.toLowerCase();
      if (key === "d") setRoute("dashboard");
      if (key === "t") setRoute("tasks");
      if (key === "f") setRoute("focus");
      if (key === "s") setRoute("stats");
      if (key === "n") {
        setRoute("tasks");
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pauseTimer, resumeTimer, route, setCommandOpen, setRoute, startTimer, timer.status]);
}
