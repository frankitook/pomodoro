const { app, BrowserWindow, ipcMain, screen, Tray, Menu, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let widgetWindow = null;
let fullscreenWindow = null;
let tray = null;

// Timer State in Main Process
let timerState = {
  isRunning: false,
  elapsed: 0,
  duration: store.get('workDuration', 25) * 60 * 1000,
  startTime: null,
  type: 'work' // 'work' or 'break'
};

let timerInterval = null;

function startTimer() {
  if (timerState.isRunning) return;
  timerState.isRunning = true;
  timerState.startTime = Date.now() - timerState.elapsed;
  
  timerInterval = setInterval(() => {
    timerState.elapsed = Date.now() - timerState.startTime;
    const remaining = Math.max(0, timerState.duration - timerState.elapsed);
    const progress = Math.min(1, timerState.elapsed / timerState.duration);
    
    const data = { remaining, progress, type: timerState.type, isRunning: true };
    broadcastToWindows('timer-tick', data);

    if (remaining <= 0) {
      completeSession();
    }
  }, 100);
}

function pauseTimer() {
  if (!timerState.isRunning) return;
  timerState.isRunning = false;
  clearInterval(timerInterval);
  timerState.elapsed = Date.now() - timerState.startTime;
  broadcastToWindows('timer-tick', { isRunning: false, remaining: timerState.duration - timerState.elapsed, progress: timerState.elapsed / timerState.duration, type: timerState.type });
}

function resetTimer() {
  pauseTimer();
  timerState.elapsed = 0;
  const duration = timerState.type === 'work' ? store.get('workDuration', 25) : store.get('breakDuration', 5);
  timerState.duration = duration * 60 * 1000;
  broadcastToWindows('timer-tick', { isRunning: false, remaining: timerState.duration, progress: 0, type: timerState.type });
}

function completeSession() {
  pauseTimer();
  const isWork = timerState.type === 'work';
  
  if (isWork) {
    new Notification({ title: 'Break time! 🌿', body: 'Take a rest, your plant is fully grown.' }).show();
    timerState.type = 'break';
    timerState.duration = store.get('breakDuration', 5) * 60 * 1000;
  } else {
    new Notification({ title: 'Focus time!', body: 'Let\'s grow another plant.' }).show();
    timerState.type = 'work';
    timerState.duration = store.get('workDuration', 25) * 60 * 1000;
  }
  
  timerState.elapsed = 0;
  broadcastToWindows('timer-complete', { type: timerState.type });
  broadcastToWindows('timer-tick', { isRunning: false, remaining: timerState.duration, progress: 0, type: timerState.type });
}

function broadcastToWindows(channel, data) {
  if (widgetWindow) widgetWindow.webContents.send(channel, data);
  if (fullscreenWindow) fullscreenWindow.webContents.send(channel, data);
}

// Window Management
function createWidgetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const lastPos = store.get('widgetPosition') || { x: width - 300, y: 100 };

  widgetWindow = new BrowserWindow({
    width: 280,
    height: 380,
    x: lastPos.x,
    y: lastPos.y,
    frame: false,
    transparent: true,
    alwaysOnTop: store.get('alwaysOnTop', true),
    resizable: false,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  widgetWindow.loadFile(path.join(__dirname, 'src/widget.html'));
  widgetWindow.on('move', () => {
    const [x, y] = widgetWindow.getPosition();
    store.set('widgetPosition', { x, y });
  });
  widgetWindow.on('closed', () => widgetWindow = null);
}

function createFullscreenWindow() {
  fullscreenWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    transparent: false,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  fullscreenWindow.loadFile(path.join(__dirname, 'src/fullscreen.html'));
  fullscreenWindow.on('closed', () => fullscreenWindow = null);
}

app.whenReady().then(() => {
  createFullscreenWindow();
});

// IPC Handlers
ipcMain.on('timer-start', startTimer);
ipcMain.on('timer-pause', pauseTimer);
ipcMain.on('timer-reset', resetTimer);
ipcMain.on('switch-to-fullscreen', () => {
  if (!fullscreenWindow) createFullscreenWindow();
  if (widgetWindow) widgetWindow.close();
});
ipcMain.on('switch-to-widget', () => {
  if (!widgetWindow) createWidgetWindow();
  if (fullscreenWindow) fullscreenWindow.close();
});
ipcMain.handle('get-timer-state', () => {
  // Sync duration with settings in case they changed
  const currentDuration = timerState.type === 'work' ? store.get('workDuration', 25) : store.get('breakDuration', 5);
  timerState.duration = currentDuration * 60 * 1000;
  
  return {
    ...timerState,
    remaining: Math.max(0, timerState.duration - timerState.elapsed),
    progress: Math.min(1, timerState.elapsed / timerState.duration)
  };
});
ipcMain.handle('get-settings', () => ({
  workDuration: store.get('workDuration', 25),
  breakDuration: store.get('breakDuration', 5),
  alwaysOnTop: store.get('alwaysOnTop', true),
  soundEnabled: store.get('soundEnabled', true),
}));
ipcMain.on('save-settings', (event, settings) => {
  store.set('workDuration', settings.workDuration);
  store.set('breakDuration', settings.breakDuration);
  store.set('alwaysOnTop', settings.alwaysOnTop);
  store.set('soundEnabled', settings.soundEnabled);
  
  // If not running, update duration immediately
  if (!timerState.isRunning) {
    const duration = timerState.type === 'work' ? settings.workDuration : settings.breakDuration;
    timerState.duration = duration * 60 * 1000;
    broadcastToWindows('timer-tick', { isRunning: false, remaining: timerState.duration, progress: 0, type: timerState.type });
  }

  if (widgetWindow) widgetWindow.setAlwaysOnTop(settings.alwaysOnTop);
});
ipcMain.on('minimize-app', () => BrowserWindow.getFocusedWindow()?.minimize());
ipcMain.on('close-app', () => app.quit());
