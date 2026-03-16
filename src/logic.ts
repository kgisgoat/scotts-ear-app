export type Direction = 'ascending' | 'descending' | 'both';

export interface AppState {
  numNotes: number;
  octaveRange: number;
  direction: Direction;
  currentNotes: number[];
}

export const state: AppState = {
  numNotes: 4,
  octaveRange: 1,
  direction: 'ascending',
  currentNotes: [],
};

export function generateNotes(): number[] {
  let valid = false;
  let notes: number[] = [];
  
  while (!valid) {
    notes = [];
    // Start note between C3 (48) and C5 (72)
    let currentMidi = Math.floor(Math.random() * 25) + 48; 
    notes.push(currentMidi);
    
    for (let i = 1; i < state.numNotes; i++) {
      let nextMidi = currentMidi;
      // Interval limit: max 12 semitones
      let step = Math.floor(Math.random() * 12) + 1; 
      
      if (state.direction === 'ascending') {
        nextMidi += step;
      } else if (state.direction === 'descending') {
        nextMidi -= step;
      } else {
        // both: randomly up or down
        const sign = Math.random() < 0.5 ? 1 : -1;
        nextMidi += step * sign;
      }
      notes.push(nextMidi);
      currentMidi = nextMidi;
    }
    
    const minNote = Math.min(...notes);
    const maxNote = Math.max(...notes);
    
    // Range limit: total span within user-selected octave range
    if (maxNote - minNote <= state.octaveRange * 12) {
      valid = true;
    }
  }
  
  state.currentNotes = notes;
  return notes;
}

const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function getNoteNames(notes: number[]): string[] {
  if (notes.length <= 1) return notes.map(midi => sharpNames[midi % 12]);
  
  let isAscending = true;
  let isDescending = true;
  
  for (let i = 1; i < notes.length; i++) {
    if (notes[i] <= notes[i-1]) isAscending = false;
    if (notes[i] >= notes[i-1]) isDescending = false;
  }
  
  // Use flats only if strictly descending
  const useFlats = isDescending && !isAscending;
  const names = useFlats ? flatNames : sharpNames;
  
  return notes.map(midi => names[midi % 12]);
}
