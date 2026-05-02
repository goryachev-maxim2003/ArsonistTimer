import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout({ children }: { children: ReactNode }) {
  const toast = useAppStore((state) => state.toast);
  const setToast = useAppStore((state) => state.setToast);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(undefined), 2600);
    return () => window.clearTimeout(timeout);
  }, [setToast, toast]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-24 xl:pb-0">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
      <MobileNav />
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--raised)] px-4 py-3 text-sm font-semibold shadow-2xl xl:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}
