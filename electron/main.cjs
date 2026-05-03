const { app, BrowserWindow, ipcMain, nativeImage, Notification, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

let autoUpdater;
try {
  autoUpdater = require("electron-updater").autoUpdater;
} catch {
  autoUpdater = undefined;
}

const isDev = Boolean(process.env.ARSONIST_DEV_SERVER_URL);
const windowsAppId = "local.arsonisttimer.desktop";
const iconPath = path.join(__dirname, "assets", "arsonisttimer-clock.png");
let mainWindow;
let updateStatus = {
  state: "idle",
  currentVersion: app.getVersion(),
  availableVersion: undefined,
  releaseName: undefined,
  releaseNotes: undefined,
  releaseDate: undefined,
  progress: undefined,
  error: undefined,
  supported: app.isPackaged && Boolean(autoUpdater),
};

function log(message) {
  try {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    const logDir = app.getPath("userData");
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, "electron-renderer.log"), line, "utf8");
  } catch {
    // Logging must never prevent the app from opening, especially in packaged asar builds.
  }
}

process.on("uncaughtException", (error) => {
  log(`uncaughtException ${error?.stack ?? error}`);
});

process.on("unhandledRejection", (error) => {
  log(`unhandledRejection ${error?.stack ?? error}`);
});

function createWindow() {
  const appIcon = nativeImage.createFromPath(iconPath);
  log(`window-icon path=${iconPath} empty=${appIcon.isEmpty()}`);
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: "ArsonistTimer",
    icon: appIcon,
    backgroundColor: "#0D0D0F",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });
  if (!appIcon.isEmpty()) mainWindow.setIcon(appIcon);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    log(`console(${level}) ${message} at ${sourceId}:${line}`);
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    log(`did-fail-load ${errorCode} ${errorDescription} ${validatedURL}`);
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    log(`render-process-gone ${JSON.stringify(details)}`);
  });
  mainWindow.webContents.on("did-finish-load", () => {
    log("did-finish-load");
  });

  if (isDev) {
    mainWindow.loadURL(process.env.ARSONIST_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

function bringAppToFront() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  mainWindow.flashFrame(true);
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.flashFrame(false);
  }, 5000);
}

function normalizeReleaseNotes(releaseNotes) {
  if (!releaseNotes) return undefined;
  if (typeof releaseNotes === "string") return releaseNotes;
  if (Array.isArray(releaseNotes)) {
    return releaseNotes
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && typeof item.note === "string") return item.note;
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return undefined;
}

function publishUpdateStatus(patch = {}) {
  updateStatus = { ...updateStatus, ...patch };
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("updates:status", updateStatus);
  });
  return updateStatus;
}

function updateInfoPatch(info = {}) {
  return {
    availableVersion: info.version,
    releaseName: info.releaseName,
    releaseNotes: normalizeReleaseNotes(info.releaseNotes),
    releaseDate: info.releaseDate,
  };
}

if (autoUpdater) {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    publishUpdateStatus({ state: "checking", error: undefined, progress: undefined });
  });

  autoUpdater.on("update-available", (info) => {
    publishUpdateStatus({ state: "available", ...updateInfoPatch(info), error: undefined, progress: undefined });
  });

  autoUpdater.on("update-not-available", (info) => {
    publishUpdateStatus({ state: "none", ...updateInfoPatch(info), error: undefined, progress: undefined });
  });

  autoUpdater.on("download-progress", (progress) => {
    publishUpdateStatus({ state: "downloading", progress, error: undefined });
  });

  autoUpdater.on("update-downloaded", (info) => {
    publishUpdateStatus({ state: "downloaded", ...updateInfoPatch(info), progress: undefined, error: undefined });
  });

  autoUpdater.on("error", (error) => {
    publishUpdateStatus({ state: "error", error: error?.message ?? String(error), progress: undefined });
  });
}

app.setName("ArsonistTimer");

if (process.platform === "win32") {
  app.setAppUserModelId(windowsAppId);
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
log(`main-start packaged=${app.isPackaged} version=${app.getVersion()} lock=${gotSingleInstanceLock} userData=${app.getPath("userData")}`);

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", bringAppToFront);
  app.on("child-process-gone", (_event, details) => {
    log(`child-process-gone ${JSON.stringify(details)}`);
  });
}

ipcMain.on("timer-complete", (_event, payload = {}) => {
  const title = typeof payload.title === "string" ? payload.title : "Таймер завершён";
  const body = typeof payload.body === "string" ? payload.body : "Откройте ArsonistTimer, чтобы выбрать следующее действие.";

  bringAppToFront();

  if (Notification.isSupported()) {
    const notification = new Notification({ title, body, silent: false });
    notification.on("click", bringAppToFront);
    notification.show();
  }
});

ipcMain.handle("updates:get-status", () => updateStatus);

ipcMain.handle("updates:check", async () => {
  if (!app.isPackaged || !autoUpdater) {
    return publishUpdateStatus({
      state: "unsupported",
      supported: app.isPackaged && Boolean(autoUpdater),
      error: "Проверка обновлений доступна только в установленной версии приложения.",
    });
  }

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    publishUpdateStatus({ state: "error", error: error?.message ?? String(error) });
  }
  return updateStatus;
});

ipcMain.handle("updates:download", async () => {
  if (!app.isPackaged || !autoUpdater) return updateStatus;
  try {
    await autoUpdater.downloadUpdate();
  } catch (error) {
    publishUpdateStatus({ state: "error", error: error?.message ?? String(error) });
  }
  return updateStatus;
});

ipcMain.handle("updates:install", () => {
  if (autoUpdater && updateStatus.state === "downloaded") {
    autoUpdater.quitAndInstall(false, true);
  }
  return updateStatus;
});

if (gotSingleInstanceLock) {
  app.whenReady().then(() => {
    log("app-ready");
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
