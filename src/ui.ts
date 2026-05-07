import { state, generateNotes, getNoteNames, Direction } from './logic';
import { playSequence, loadInstrument } from './audio';

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
