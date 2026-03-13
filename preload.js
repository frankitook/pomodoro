const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  switchToFullscreen: () => ipcRenderer.send('switch-to-fullscreen'),
  switchToWidget: () => ipcRenderer.send('switch-to-widget'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  
  // Timer Actions
  startTimer: () => ipcRenderer.send('timer-start'),
  pauseTimer: () => ipcRenderer.send('timer-pause'),
  resetTimer: () => ipcRenderer.send('timer-reset'),
  getTimerState: () => ipcRenderer.invoke('get-timer-state'),
  
  // Timer Events
  onTimerTick: (callback) => ipcRenderer.on('timer-tick', (event, data) => callback(data)),
  onTimerComplete: (callback) => ipcRenderer.on('timer-complete', (event, data) => callback(data))
});
