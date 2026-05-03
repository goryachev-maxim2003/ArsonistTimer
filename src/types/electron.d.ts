export {};

type UpdateState = "idle" | "checking" | "available" | "downloading" | "downloaded" | "none" | "error" | "unsupported";

interface ArsonistUpdateStatus {
  state: UpdateState;
  currentVersion: string;
  availableVersion?: string;
  releaseName?: string;
  releaseNotes?: string;
  releaseDate?: string;
  progress?: {
    percent?: number;
    bytesPerSecond?: number;
    transferred?: number;
    total?: number;
  };
  error?: string;
  supported: boolean;
}

declare global {
  interface Window {
    arsonistDesktop?: {
      platform: string;
      mode: "desktop";
      notifyTimerComplete?: (payload: { title: string; body?: string }) => void;
      updates?: {
        getStatus: () => Promise<ArsonistUpdateStatus>;
        check: () => Promise<ArsonistUpdateStatus>;
        download: () => Promise<ArsonistUpdateStatus>;
        install: () => Promise<ArsonistUpdateStatus>;
        onStatus: (callback: (status: ArsonistUpdateStatus) => void) => () => void;
      };
    };
  }
}
