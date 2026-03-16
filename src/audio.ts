import Soundfont from 'soundfont-player';

// Initialize AudioContext lazily to comply with browser autoplay policies
let audioCtx: AudioContext | null = null;
let guitarInstrument: any = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export async function loadInstrument(): Promise<void> {
  const ctx = getAudioContext();
  if (!guitarInstrument) {
    // Load acoustic guitar steel soundfont
    guitarInstrument = await Soundfont.instrument(ctx, 'acoustic_guitar_steel', {
      soundfont: 'MusyngKite' // High quality soundfont
    });
  }
}

export function playTone(midiNote: number, startTime: number, duration: number) {
  if (guitarInstrument) {
    guitarInstrument.play(midiNote, startTime, { duration: duration });
  } else {
    // Fallback to synth if not loaded
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Sawtooth wave for rich string harmonics
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    
    // Lowpass filter envelope to simulate the pluck (bright attack, mellow decay)
    filter.type = 'lowpass';
    filter.Q.value = 2; // Slight resonance
    filter.frequency.setValueAtTime(freq * 5, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq, startTime + 0.1);
    
    // Amplitude envelope: sharp attack, exponential decay
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export function playSequence(notes: number[]) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const now = ctx.currentTime;
  const noteDuration = 2.5; // Let notes ring out like a guitar
  const step = 0.6; // Time between consecutive notes
  
  notes.forEach((note, index) => {
    playTone(note, now + index * step, noteDuration);
  });
}

export function playClick(time: number) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.value = 800;
  
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(0.5, time + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.1);
}

