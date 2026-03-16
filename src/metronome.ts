import { playClick, getAudioContext } from './audio';

let isPlaying = false;
let bpm = 120;
let nextNoteTime = 0;
let timerID: number | null = null;
const lookahead = 25.0; // ms
const scheduleAheadTime = 0.1; // s

let onBeatCallback: (() => void) | null = null;

export function setMetronomeCallback(cb: () => void) {
  onBeatCallback = cb;
}

export function setBpm(newBpm: number) {
  bpm = newBpm;
}

export function toggleMetronome(): boolean {
  isPlaying = !isPlaying;
  if (isPlaying) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    nextNoteTime = ctx.currentTime + 0.05;
    scheduler();
  } else {
    if (timerID !== null) {
      window.clearTimeout(timerID);
      timerID = null;
    }
  }
  return isPlaying;
}

function scheduler() {
  const ctx = getAudioContext();
  while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
    scheduleNote(nextNoteTime);
    nextNoteTime += 60.0 / bpm;
  }
  timerID = window.setTimeout(scheduler, lookahead);
}

function scheduleNote(time: number) {
  playClick(time);
  if (onBeatCallback) {
    const ctx = getAudioContext();
    const delay = time - ctx.currentTime;
    setTimeout(onBeatCallback, Math.max(0, delay * 1000));
  }
}
