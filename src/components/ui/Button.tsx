import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[var(--primary)] text-black hover:brightness-110 shadow-ember",
  secondary: "raised text-[var(--text)] hover:border-[var(--primary)]",
  ghost: "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]",
  danger: "bg-ember-danger/15 text-ember-danger border border-ember-danger/35 hover:bg-ember-danger/25",
};

export function Button({ className = "", variant = "secondary", icon, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
