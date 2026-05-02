import { useEffect } from "react";
import { useAppStore } from "../store/appStore";

const themes = {
  "dark-ember": {
    bg: "#0D0D0F",
    surface: "#17171A",
    raised: "#222226",
    border: "#2F2F35",
    text: "#F5F2EB",
    muted: "#A3A3A3",
    primary: "#FF6A00",
  },
  charcoal: {
    bg: "#101113",
    surface: "#191B1F",
    raised: "#24272D",
    border: "#333842",
    text: "#F6F7F9",
    muted: "#A8B0BA",
    primary: "#FF9A3C",
  },
  midnight: {
    bg: "#07111F",
    surface: "#0D1B2D",
    raised: "#142844",
    border: "#28415F",
    text: "#F4F8FF",
    muted: "#9FB3CC",
    primary: "#55B6FF",
  },
  "ash-light": {
    bg: "#F6F2EA",
    surface: "#FFFFFF",
    raised: "#EEE7DD",
    border: "#D8CFC3",
    text: "#201D1A",
    muted: "#6A625B",
    primary: "#D85A00",
  },
  "forest-focus": {
    bg: "#08130E",
    surface: "#102018",
    raised: "#1A3126",
    border: "#2B4D3D",
    text: "#F0FFF8",
    muted: "#9BB7A9",
    primary: "#3DDC84",
  },
  "deep-ocean": {
    bg: "#06131B",
    surface: "#0D2230",
    raised: "#163449",
    border: "#27506A",
    text: "#F2FAFF",
    muted: "#9CB7C7",
    primary: "#5DADEC",
  },
};

export function useTheme() {
  const appearance = useAppStore((state) => state.settings.appearance);

  useEffect(() => {
    const theme = themes[appearance.theme];
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--raised", theme.raised);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--primary", appearance.accentColor || theme.primary);
    root.classList.toggle("reduced-motion", appearance.reducedMotion);
    root.classList.toggle("compact-mode", appearance.compactMode);
  }, [appearance]);
}
