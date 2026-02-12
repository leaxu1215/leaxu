// Web Audio API sound synthesizer for Catdoku
// All sounds are generated programmatically — no audio files needed

let ctx = null;
let muted = localStorage.getItem('catdoku-muted') === 'true';

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem('catdoku-muted', muted);
  return muted;
}

// Helper: play a tone with envelope
function tone(freq, duration, type = 'sine', volume = 0.15, startTime = 0) {
  const c = getCtx();
  const t = c.currentTime + startTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

// Helper: noise burst
function noiseBurst(duration, volume = 0.08) {
  const c = getCtx();
  const t = c.currentTime;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start(t);
}

const sounds = {
  click() {
    tone(1200, 0.03, 'sine', 0.06);
  },

  coin() {
    // Classic coin ding — B5 then E6
    tone(988, 0.08, 'sine', 0.15);
    tone(1319, 0.15, 'sine', 0.12, 0.07);
  },

  error() {
    // Low buzzy descend
    tone(330, 0.12, 'square', 0.08);
    tone(262, 0.18, 'square', 0.06, 0.1);
  },

  erase() {
    noiseBurst(0.1, 0.06);
  },

  meow() {
    // Synth meow: frequency sweep up then down
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.08);
    osc.frequency.linearRampToValueAtTime(500, t + 0.2);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  },

  mew() {
    // Short sad mew — lower pitch
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.linearRampToValueAtTime(350, t + 0.15);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  },

  win() {
    // Victory jingle — ascending arpeggio C5-E5-G5-C6-E6
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      tone(freq, 0.2, 'triangle', 0.12, i * 0.1);
    });
  },

  gameOver() {
    // Sad descending — E4-C4-A3
    const notes = [330, 262, 220];
    notes.forEach((freq, i) => {
      tone(freq, 0.25, 'sawtooth', 0.06, i * 0.2);
    });
  },

  hint() {
    // Sparkle tinkle — high notes
    tone(2093, 0.08, 'sine', 0.08);
    tone(2637, 0.1, 'sine', 0.06, 0.06);
    tone(3136, 0.12, 'sine', 0.04, 0.12);
  },

  undo() {
    // Quick reverse swoosh
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(400, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  },

  noteToggle() {
    tone(800, 0.025, 'sine', 0.05);
  },
};

export function playSound(name) {
  if (muted) return;
  try {
    if (sounds[name]) sounds[name]();
  } catch (e) {
    // Silently fail if AudioContext not available
  }
}
