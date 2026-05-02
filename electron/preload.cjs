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
});
