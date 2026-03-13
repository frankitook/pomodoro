class PomodoroTimer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.startTime = null;
    this.elapsed = 0;
    this.duration = 25 * 60 * 1000;
    this.interval = null;
    this.isRunning = false;
    this.type = 'work'; // 'work' or 'break'
  }

  setDuration(minutes) {
    this.duration = minutes * 60 * 1000;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now() - this.elapsed;
    this.interval = setInterval(() => this.tick(), 100);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.interval);
    this.elapsed = Date.now() - this.startTime;
  }

  reset() {
    this.pause();
    this.elapsed = 0;
    this.tick();
  }

  tick() {
    if (this.isRunning) {
      this.elapsed = Date.now() - this.startTime;
    }

    const remaining = Math.max(0, this.duration - this.elapsed);
    const progress = Math.min(1, this.elapsed / this.duration);

    this.onTick(remaining, progress, this.type);

    if (remaining <= 0 && this.isRunning) {
      this.complete();
    }
  }

  complete() {
    this.pause();
    this.onComplete(this.type);
  }
}
