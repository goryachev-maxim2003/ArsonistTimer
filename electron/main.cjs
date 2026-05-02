const { app, BrowserWindow, ipcMain, nativeImage, Notification, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const isDev = Boolean(process.env.ARSONIST_DEV_SERVER_URL);
const windowsAppId = "local.arsonisttimer.desktop";
const iconPath = path.join(__dirname, "assets", "arsonisttimer-clock.png");
let mainWindow;

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(path.join(__dirname, "..", "electron-renderer.log"), line, "utf8");
}

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

app.setName("ArsonistTimer");

if (process.platform === "win32") {
  app.setAppUserModelId(windowsAppId);
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

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
