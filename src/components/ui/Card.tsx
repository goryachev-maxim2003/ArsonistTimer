import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function Card({ title, eyebrow, action, className = "", children, ...props }: CardProps) {
  return (
    <section className={`surface compactable rounded-lg p-5 ${className}`} {...props}>
      {(title || eyebrow || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
