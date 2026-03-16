let timerInterval: number | null = null;
let remainingSeconds = 0;
let onTick: ((formattedTime: string) => void) | null = null;
let onComplete: (() => void) | null = null;

export function setTimerCallbacks(tickCb: (time: string) => void, completeCb: () => void) {
  onTick = tickCb;
  onComplete = completeCb;
}

export function startTimer(minutes: number, seconds: number) {
  if (timerInterval) clearInterval(timerInterval);
  remainingSeconds = minutes * 60 + seconds;
  
  if (remainingSeconds <= 0) return;
  
  updateDisplay();
  timerInterval = window.setInterval(() => {
    remainingSeconds--;
    updateDisplay();
    if (remainingSeconds <= 0) {
      stopTimer();
      if (onComplete) onComplete();
    }
  }, 1000);
}

export function resumeTimer() {
  if (timerInterval) return;
  if (remainingSeconds <= 0) return;
  
  timerInterval = window.setInterval(() => {
    remainingSeconds--;
    updateDisplay();
    if (remainingSeconds <= 0) {
      stopTimer();
      if (onComplete) onComplete();
    }
  }, 1000);
}

export function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function stopTimer() {
  pauseTimer();
  remainingSeconds = 0;
  updateDisplay();
}

function updateDisplay() {
  if (!onTick) return;
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  onTick(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
}
