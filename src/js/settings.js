async function loadSettings() {
  const settings = await window.electronAPI.getSettings();
  
  const workInput = document.getElementById('work-input');
  const breakInput = document.getElementById('break-input');
  const ontopCheckbox = document.getElementById('ontop-checkbox');
  const soundCheckbox = document.getElementById('sound-checkbox');

  if (workInput) workInput.value = settings.workDuration;
  if (breakInput) breakInput.value = settings.breakDuration;
  if (ontopCheckbox) ontopCheckbox.checked = settings.alwaysOnTop;
  if (soundCheckbox) soundCheckbox.checked = settings.soundEnabled;

  return settings;
}

function initSettings() {
  const saveBtn = document.getElementById('save-settings-btn');
  const cancelBtn = document.getElementById('close-settings-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const panel = document.getElementById('settings-panel');

  if (settingsBtn) {
    settingsBtn.onclick = async () => {
      await loadSettings();
      panel.classList.remove('hidden');
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => panel.classList.add('hidden');
  }

  if (saveBtn) {
    saveBtn.onclick = () => {
      const settings = {
        workDuration: parseInt(document.getElementById('work-input').value),
        breakDuration: parseInt(document.getElementById('break-input').value),
        alwaysOnTop: document.getElementById('ontop-checkbox').checked,
        soundEnabled: document.getElementById('sound-checkbox').checked,
      };
      window.electronAPI.saveSettings(settings);
      panel.classList.add('hidden');
      // Reload durations in the active app instance
      if (window.timer) {
        window.timer.setDuration(window.timer.type === 'work' ? settings.workDuration : settings.breakDuration);
        window.timer.reset();
      }
    };
  }
}
