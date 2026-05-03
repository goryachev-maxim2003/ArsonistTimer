const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("arsonistDesktop", {
  platform: process.platform,
  mode: "desktop",
  notifyTimerComplete(payload) {
    ipcRenderer.send("timer-complete", {
      title: typeof payload?.title === "string" ? payload.title : "Таймер завершен",
      body: typeof payload?.body === "string" ? payload.body : "",
    });
  },
  updates: {
    getStatus() {
      return ipcRenderer.invoke("updates:get-status");
    },
    check() {
      return ipcRenderer.invoke("updates:check");
    },
    download() {
      return ipcRenderer.invoke("updates:download");
    },
    install() {
      return ipcRenderer.invoke("updates:install");
    },
    onStatus(callback) {
      if (typeof callback !== "function") return () => undefined;
      const listener = (_event, status) => callback(status);
      ipcRenderer.on("updates:status", listener);
      return () => ipcRenderer.removeListener("updates:status", listener);
    },
  },
});
