import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
      <p className="text-lg font-semibold text-[var(--text)]">{title}</p>
      {children && <p className="mt-2 text-sm text-[var(--muted)]">{children}</p>}
    </div>
  );
}
