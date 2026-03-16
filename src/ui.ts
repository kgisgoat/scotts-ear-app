import { state, generateNotes, getNoteNames, Direction } from './logic';
import { playSequence, loadInstrument } from './audio';
import { toggleMetronome, setBpm, setMetronomeCallback } from './metronome';
import { startTimer, resumeTimer, pauseTimer, stopTimer, setTimerCallbacks } from './timer';

export function initUI() {
  // --- Settings ---
  const numNotesInput = document.getElementById('num-notes') as HTMLInputElement;
  const numNotesVal = document.getElementById('num-notes-val')!;
  numNotesInput.addEventListener('input', (e) => {
    state.numNotes = parseInt((e.target as HTMLInputElement).value, 10);
    numNotesVal.textContent = state.numNotes.toString();
  });

  const octaveRangeInput = document.getElementById('octave-range') as HTMLInputElement;
  const octaveRangeVal = document.getElementById('octave-range-val')!;
  octaveRangeInput.addEventListener('input', (e) => {
    state.octaveRange = parseInt((e.target as HTMLInputElement).value, 10);
    octaveRangeVal.textContent = state.octaveRange.toString();
  });

  const directionInputs = document.querySelectorAll('input[name="direction"]');
  directionInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if ((e.target as HTMLInputElement).checked) {
        state.direction = (e.target as HTMLInputElement).value as Direction;
      }
    });
  });

  // --- Metronome ---
  const metroToggle = document.getElementById('metro-toggle')!;
  const metroPlayIcon = document.getElementById('metro-play-icon')!;
  const metroStopIcon = document.getElementById('metro-stop-icon')!;
  const bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
  const bpmVal = document.getElementById('bpm-val')!;
  const metroIndicator = document.getElementById('metro-indicator')!;

  bpmSlider.addEventListener('input', (e) => {
    const bpm = parseInt((e.target as HTMLInputElement).value, 10);
    bpmVal.textContent = bpm.toString();
    setBpm(bpm);
  });

  metroToggle.addEventListener('click', () => {
    const isPlaying = toggleMetronome();
    if (isPlaying) {
      metroPlayIcon.classList.add('hidden');
      metroStopIcon.classList.remove('hidden');
    } else {
      metroPlayIcon.classList.remove('hidden');
      metroStopIcon.classList.add('hidden');
    }
  });

  setMetronomeCallback(() => {
    metroIndicator.classList.remove('bg-slate-300');
    metroIndicator.classList.add('bg-emerald-500');
    setTimeout(() => {
      metroIndicator.classList.remove('bg-emerald-500');
      metroIndicator.classList.add('bg-slate-300');
    }, 100);
  });

  // --- Timer ---
  const timerM = document.getElementById('timer-m') as HTMLInputElement;
  const timerS = document.getElementById('timer-s') as HTMLInputElement;
  const timerSetup = document.getElementById('timer-setup')!;
  const timerDisplay = document.getElementById('timer-display')!;
  const btnTimerStart = document.getElementById('timer-start')!;
  const btnTimerPause = document.getElementById('timer-pause')!;
  const btnTimerReset = document.getElementById('timer-reset')!;

  let timerState: 'stopped' | 'running' | 'paused' = 'stopped';

  setTimerCallbacks(
    (timeStr) => {
      timerDisplay.textContent = timeStr;
    },
    () => {
      // Complete
      timerState = 'stopped';
      timerSetup.classList.remove('hidden');
      timerDisplay.classList.add('hidden');
      btnTimerStart.classList.remove('hidden');
      btnTimerPause.classList.add('hidden');
      btnTimerStart.textContent = 'Start';
      
      // Play a ding to notify completion
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.frequency.value = 880;
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }
  );

  btnTimerStart.addEventListener('click', () => {
    if (timerState === 'stopped') {
      const m = parseInt(timerM.value, 10) || 0;
      const s = parseInt(timerS.value, 10) || 0;
      if (m === 0 && s === 0) return;
      startTimer(m, s);
      timerSetup.classList.add('hidden');
      timerDisplay.classList.remove('hidden');
    } else if (timerState === 'paused') {
      resumeTimer();
    }
    timerState = 'running';
    btnTimerStart.classList.add('hidden');
    btnTimerPause.classList.remove('hidden');
  });

  btnTimerPause.addEventListener('click', () => {
    if (timerState === 'running') {
      pauseTimer();
      timerState = 'paused';
      btnTimerPause.classList.add('hidden');
      btnTimerStart.classList.remove('hidden');
      btnTimerStart.textContent = 'Resume';
    }
  });

  btnTimerReset.addEventListener('click', () => {
    stopTimer();
    timerState = 'stopped';
    timerSetup.classList.remove('hidden');
    timerDisplay.classList.add('hidden');
    btnTimerPause.classList.add('hidden');
    btnTimerStart.classList.remove('hidden');
    btnTimerStart.textContent = 'Start';
  });

  // --- Action Area ---
  const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  const btnReplay = document.getElementById('btn-replay') as HTMLButtonElement;
  const btnShow = document.getElementById('btn-show') as HTMLButtonElement;
  const notesText = document.getElementById('notes-text')!;

  btnPlay.addEventListener('click', async () => {
    const originalText = btnPlay.textContent;
    btnPlay.disabled = true;
    btnPlay.textContent = 'Loading Guitar...';
    btnPlay.classList.add('opacity-50', 'cursor-wait');
    
    try {
      await loadInstrument();
    } catch (e) {
      console.error('Failed to load instrument', e);
    }
    
    btnPlay.disabled = false;
    btnPlay.textContent = originalText;
    btnPlay.classList.remove('opacity-50', 'cursor-wait');

    const notes = generateNotes();
    playSequence(notes);
    
    notesText.textContent = '???';
    notesText.classList.remove('text-slate-900', 'font-bold');
    notesText.classList.add('text-slate-400');
    
    btnShow.disabled = false;
    btnShow.classList.remove('opacity-50', 'cursor-not-allowed');
    
    btnReplay.disabled = false;
    btnReplay.classList.remove('opacity-50', 'cursor-not-allowed');
  });

  btnReplay.addEventListener('click', () => {
    if (state.currentNotes.length > 0) {
      playSequence(state.currentNotes);
    }
  });

  btnShow.addEventListener('click', () => {
    if (state.currentNotes.length === 0) return;
    
    const names = getNoteNames(state.currentNotes);
    notesText.textContent = names.join(' - ');
    notesText.classList.remove('text-slate-400');
    notesText.classList.add('text-slate-900', 'font-bold');
    
    btnShow.disabled = true;
    btnShow.classList.add('opacity-50', 'cursor-not-allowed');
  });
}
