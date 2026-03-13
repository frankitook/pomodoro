function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function initApp() {
  const timerText = document.getElementById('timer-text');
  const progressBar = document.getElementById('progress-bar');
  const sessionLabel = document.getElementById('session-label');
  const startPauseBtn = document.getElementById('start-pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const expandBtn = document.getElementById('expand-btn');
  const collapseBtn = document.getElementById('collapse-btn');
  const minimizeBtn = document.getElementById('minimize-btn');
  const closeBtn = document.getElementById('close-btn');

  // Initial State Sync
  const initialState = await window.electronAPI.getTimerState();
  updateUI(initialState);

  function updateUI(data) {
    if (timerText) timerText.textContent = formatTime(data.remaining);
    if (progressBar) progressBar.setAttribute('width', data.progress * 180);
    if (sessionLabel) sessionLabel.textContent = data.type === 'work' ? 'Focus' : 'Break';
    if (startPauseBtn) startPauseBtn.textContent = data.isRunning ? 'Pause' : 'Start';
    
    updatePlant(data.progress, data.type === 'break');
  }

  // Listen for background timer updates
  window.electronAPI.onTimerTick((data) => {
    updateUI(data);
  });

  window.electronAPI.onTimerComplete(async (data) => {
    const settings = await window.electronAPI.getSettings();
    if (settings.soundEnabled) {
      const audio = new Audio('../sonido.mp3');
      audio.play();
    }
  });

  // Controls
  if (startPauseBtn) {
    startPauseBtn.onclick = async () => {
      const state = await window.electronAPI.getTimerState();
      if (state.isRunning) {
        window.electronAPI.pauseTimer();
      } else {
        window.electronAPI.startTimer();
      }
    };
  }

  if (resetBtn) resetBtn.onclick = () => window.electronAPI.resetTimer();
  if (expandBtn) expandBtn.onclick = () => window.electronAPI.switchToFullscreen();
  if (collapseBtn) collapseBtn.onclick = () => window.electronAPI.switchToWidget();
  if (minimizeBtn) minimizeBtn.onclick = () => window.electronAPI.minimizeApp();
  if (closeBtn) closeBtn.onclick = () => window.electronAPI.closeApp();

  if (typeof initSettings === 'function') {
    initSettings();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
