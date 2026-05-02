import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "primary" | "success" | "danger" | "muted";
  className?: string;
}

const tones = {
  default: "bg-white/[0.08] text-[var(--text)] border-white/10",
  primary: "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30",
  success: "bg-ember-success/15 text-ember-success border-ember-success/30",
  danger: "bg-ember-danger/15 text-ember-danger border-ember-danger/30",
  muted: "bg-white/5 text-[var(--muted)] border-white/10",
};

export function Badge({ children, tone = "default", className = "" }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
}
