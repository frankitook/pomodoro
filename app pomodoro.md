# Pomodoro Plant — Project Specification

## Overview
A desktop Pomodoro timer app with an aesthetic growing plant. The plant grows visually during each focus session and resets when the session ends. Designed to be sold on Gumroad as a one-time purchase for Windows and macOS.

## Tech Stack
- **Framework**: Electron (cross-platform Windows/macOS)
- **UI**: HTML + CSS + JavaScript (vanilla, no heavy frameworks)
- **Plant animation**: SVG animated with CSS/JS (no canvas needed)
- **Persistence**: electron-store for saving user settings (custom times)
- **Packaging**: electron-builder (produces .exe for Windows, .dmg for macOS)

---

## Visual Design & Aesthetics

### Style
- **Theme**: Lo-fi / warm — cozy study aesthetic
- **Mood**: afternoon light, soft and calm, like a desk near a window
- **Feel**: analog warmth meets clean digital UI

### Color Palette
```
Background:       #F5ECD7  (warm beige / parchment)
Surface/Card:     #EDE0C4  (slightly darker beige)
Accent warm:      #C8956C  (terracotta / warm orange)
Accent green:     #7BAE7F  (muted sage green — plant color)
Text primary:     #3D2B1F  (dark brown)
Text secondary:   #8B6F5E  (medium brown)
Timer ring:       #C8956C  (terracotta)
Break ring:       #7BAE7F  (sage green)
Widget shadow:    rgba(61, 43, 31, 0.15)
```

### Typography
- **Primary font**: "Crimson Pro" or "Lora" (serif, warm, readable) — load from Google Fonts
- **Timer digits**: "DM Mono" or "Space Mono" (monospace, clean)
- **Fallback**: Georgia, serif

### Visual Details
- Soft drop shadows, no harsh borders
- Rounded corners (12–16px radius on cards)
- Subtle texture overlay on background (optional: a very faint grain/noise CSS filter)
- No icons from icon packs — use simple hand-drawn style SVGs or CSS shapes
- Warm gradient on the window background (top slightly lighter, bottom slightly darker)

---

## Window & Layout

### Two Modes

#### 1. Widget Mode (default on launch)
- **Size**: 280 × 340 px, always on top (`alwaysOnTop: true`)
- **Window style**: frameless (`frame: false`), transparent background
- **Draggable**: yes, drag anywhere on screen by clicking the top area
- **Resizable**: no
- **Contents**:
  - Plant SVG (top ~45% of widget)
  - Timer display (minutes:seconds, large)
  - Thin circular progress ring around or below timer
  - Start / Pause / Reset buttons (minimal icons or text)
  - Small expand icon (↗) in top-right corner to switch to fullscreen

#### 2. Fullscreen / Focus Mode
- **Size**: fills the screen (or a large centered window ~800 × 600 px minimum)
- **Window style**: no standard title bar, custom titlebar
- **Contents**:
  - Large plant SVG centered (takes up ~50% of the screen)
  - Big timer below the plant
  - Session label ("Focus", "Break")
  - Start / Pause / Reset
  - Settings button (gear icon) — opens settings panel
  - Collapse icon to go back to widget mode

### Settings Panel (accessible from fullscreen)
- Work duration: slider or input (1–90 min, default 25)
- Break duration: slider or input (1–30 min, default 5)
- Always on top: toggle (default ON for widget, OFF for fullscreen)
- "Save" button

---

## Pomodoro Timer Logic

### Session Flow
1. App opens → timer shows 25:00, plant is a small seedling
2. User presses Start → timer counts down, plant grows progressively
3. At 00:00 (work session ends) → system notification fires ("Break time! 🌿"), plant is fully grown, timer auto-switches to break (5:00)
4. Break timer counts down (plant stays fully grown but maybe gently sways)
5. Break ends → notification fires ("Focus time!"), plant resets to seedling, work timer reloads
6. Cycle repeats

### Behavior Details
- If user **minimizes or moves away**: timer keeps running (relaxed mode — no punishment)
- If user presses **Reset**: timer returns to work start, plant resets to seedling
- If user presses **Pause**: timer pauses, plant stops growing (freezes at current stage)
- Timer persists correctly even when window is in background (use `Date.now()` delta, not `setInterval` drift)

### Notifications
- Use Electron's built-in `new Notification()` or `electron.Notification`
- Two notification events: work session ends, break session ends
- No sounds (user chose no audio)

---

## The Plant — Design & Animation

### Art Style: Pixel Art Sprites
- All plant stages are **individual PNG files** with transparent background
- Pixel art style — cozy, lo-fi, Stardew Valley aesthetic
- Render in HTML with `image-rendering: pixelated` so they scale up crisply without blur
- Display size in widget: ~140×140 px (scale up from source with CSS)
- Display size in fullscreen: ~260×260 px

### Plant Stages (7 PNG sprites tied to % of session elapsed)
```
Stage 0 →  0%        — plant-0.png  — bare soil, tiny sprout nub
Stage 1 →  1–15%     — plant-1.png  — small shoot, 1 leaf
Stage 2 →  16–30%    — plant-2.png  — taller stem, 2 leaves
Stage 3 →  31–50%    — plant-3.png  — branching, 3–4 leaves
Stage 4 →  51–70%    — plant-4.png  — fuller plant, flower bud
Stage 5 →  71–90%    — plant-5.png  — flower opening
Stage 6 →  91–100%   — plant-6.png  — flower fully open ✿
```

### Sprite File Conventions
- All sprites stored in `src/assets/sprites/`
- Named exactly: `plant-0.png` through `plant-6.png`
- Transparent background (PNG with alpha)
- All sprites same canvas size (e.g. 128×128 px) so they don't shift position when swapping
- The terracotta pot should be included in each sprite (not separate), so everything is self-contained

### Implementation Approach
```html
<!-- Single <img> tag, src swaps via JS -->
<img id="plant-sprite" src="src/assets/sprites/plant-0.png" alt="plant" />
```
```css
#plant-sprite {
  width: 140px;
  height: 140px;
  image-rendering: pixelated;
  image-rendering: crisp-edges; /* Firefox fallback */
  transition: opacity 0.3s ease;
}
```
```js
// In plant.js — swap sprite based on session progress
const stages = [0, 0.01, 0.16, 0.31, 0.51, 0.71, 0.91];

function updatePlant(progress) {
  let stage = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (progress >= stages[i]) { stage = i; break; }
  }
  const sprite = document.getElementById('plant-sprite');
  if (sprite.dataset.stage !== String(stage)) {
    sprite.style.opacity = 0;
    setTimeout(() => {
      sprite.src = `src/assets/sprites/plant-${stage}.png`;
      sprite.style.opacity = 1;
      sprite.dataset.stage = stage;
    }, 150); // quick fade between stages
  }
}
```

### Animations
- **Stage transition**: fade out → swap src → fade in (150ms, handled in JS as above)
- **During break**: CSS keyframe sway on the `<img>` — subtle ±3° rotation, 3s loop
- **On session reset**: fade out plant, reset to `plant-0.png`, fade in

```css
@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50%       { transform: rotate(2deg); }
}
.plant-break {
  animation: sway 3s ease-in-out infinite;
  transform-origin: bottom center;
}
```

---

## Project Structure
```
pomodoro-plant/
├── package.json
├── main.js                  # Electron main process
├── preload.js               # Context bridge (if needed)
├── src/
│   ├── widget.html          # Widget mode UI
│   ├── fullscreen.html      # Fullscreen mode UI
│   ├── styles/
│   │   ├── base.css         # Shared variables, fonts, reset
│   │   ├── widget.css
│   │   └── fullscreen.css
│   ├── js/
│   │   ├── timer.js         # Timer logic (drift-proof)
│   │   ├── plant.js         # Plant stage manager
│   │   ├── settings.js      # Load/save settings via electron-store
│   │   └── app.js           # Main UI controller
│   └── assets/
│       └── sprites/
│           ├── plant-0.png  # Stage 0 — bare soil / sprout nub
│           ├── plant-1.png  # Stage 1 — small shoot
│           ├── plant-2.png  # Stage 2 — taller stem
│           ├── plant-3.png  # Stage 3 — branching
│           ├── plant-4.png  # Stage 4 — flower bud
│           ├── plant-5.png  # Stage 5 — flower opening
│           └── plant-6.png  # Stage 6 — flower fully open
├── build/
│   ├── icon.icns            # macOS icon
│   ├── icon.ico             # Windows icon
│   └── icon.png             # 512×512 source
└── electron-builder.yml
```

---

## package.json — Key Dependencies
```json
{
  "name": "pomodoro-plant",
  "version": "1.0.0",
  "description": "A cozy Pomodoro timer with a growing plant",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win",
    "build:all": "electron-builder --mac --win"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0"
  },
  "dependencies": {
    "electron-store": "^8.1.0"
  }
}
```

---

## electron-builder.yml
```yaml
appId: com.yourname.pomodoroPlant
productName: Pomodoro Plant
copyright: Copyright © 2025

mac:
  category: public.app-category.productivity
  icon: build/icon.icns
  target:
    - target: dmg
    - target: zip

win:
  icon: build/icon.ico
  target:
    - target: nsis
    - target: portable

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

---

## main.js — Key Electron Config Notes
```js
// Widget window config
const widgetWindow = new BrowserWindow({
  width: 280,
  height: 340,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  resizable: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
  }
});

// Fullscreen window config
const fullscreenWindow = new BrowserWindow({
  width: 900,
  height: 650,
  minWidth: 700,
  minHeight: 500,
  frame: false,
  transparent: false,
  alwaysOnTop: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
  }
});
```
- Use IPC (`ipcMain` / `ipcRenderer`) to communicate between widget and fullscreen windows if both can be open simultaneously, or simply close one and open the other when switching modes.
- Store window position on close and restore it on next launch (so the widget always appears where the user left it).

---

## Timer Logic — Drift-Proof Implementation
```js
// In timer.js — use timestamps, not setInterval counting
let startTime = null;
let elapsed = 0;
let duration = 25 * 60 * 1000; // ms
let interval = null;

function start() {
  startTime = Date.now() - elapsed;
  interval = setInterval(tick, 500);
}

function tick() {
  elapsed = Date.now() - startTime;
  const remaining = Math.max(0, duration - elapsed);
  const progress = elapsed / duration; // 0.0 → 1.0
  updateUI(remaining, progress);
  if (remaining <= 0) complete();
}
```

---

## UX Details & Polish

- **Custom titlebar** in fullscreen: thin bar with app name on left, window controls (minimize, close) on right — styled to match the warm aesthetic, no default OS chrome
- **Drag region** in widget: top 40px is `-webkit-app-region: drag`, buttons are `-webkit-app-region: no-drag`
- **System tray icon**: add a tray icon so the app is accessible even when widget is hidden (right-click menu: Show, Pause/Resume, Quit)
- **On first launch**: show a small welcome tooltip "Your plant grows as you focus 🌱"
- **Smooth transitions**: all mode switches (widget ↔ fullscreen) fade out / fade in (opacity transition 200ms)
- **Window remembers position**: save widget position to electron-store, restore on relaunch

---

## What NOT to Build (keep it simple for v1)
- No user accounts or cloud sync
- No sound or music player
- No statistics or history tracking
- No themes switcher (one warm theme only)
- No multiple plants to unlock
- No onboarding tutorial screens
- No auto-updater (ship as a static download on Gumroad)

These can be added in a v2 / paid update if the product sells well.

---

## Gumroad Distribution Notes
- Ship two separate downloads: `Pomodoro-Plant-mac.dmg` and `Pomodoro-Plant-win.exe`
- Recommended price: **$7–9 USD**
- For macOS: the app will need to be signed and notarized (or users will get a Gatekeeper warning). Minimum: instruct buyers to right-click → Open to bypass unsigned warning.
- For Windows: NSIS installer is fine for Gumroad distribution without a code signing certificate.

---

## Summary Card
| Parameter | Value |
|---|---|
| Framework | Electron |
| Aesthetic | Lo-fi warm, beige/terracotta/sage |
| Window | Widget (280×340) + Fullscreen expandable |
| Plant | 7-stage SVG, resets each session |
| Timer | 25 min work / 5 min break (customizable) |
| Audio | None |
| If minimized | Timer keeps running |
| Stats | None |
| Language | English |
| Monetization | One-time purchase (Gumroad) |
| Target | Windows + macOS |
