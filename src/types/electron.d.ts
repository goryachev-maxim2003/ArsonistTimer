export {};

declare global {
  interface Window {
    arsonistDesktop?: {
      platform: string;
      mode: "desktop";
      notifyTimerComplete?: (payload: { title: string; body?: string }) => void;
    };
  }
}
