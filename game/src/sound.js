// Tiny WebAudio synth: card snaps, hits, heals and the win flourish.
// No audio files — every sound is a few oscillators.

let ctx = null;
let muted = false;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, gain, when = 0, slideTo = null) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function soundPlay() { tone(520, 0.09, 'triangle', 0.12, 0, 760); }
export function soundHit() { tone(180, 0.16, 'sawtooth', 0.16, 0, 70); }
export function soundGuard() { tone(300, 0.12, 'square', 0.07); }
export function soundHeal() { tone(660, 0.18, 'sine', 0.1, 0, 990); }
export function soundFoeHit() { tone(140, 0.18, 'sawtooth', 0.16, 0, 60); }
export function soundWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.13, i * 0.11));
}
export function soundLose() {
  [392, 330, 262, 196].forEach((f, i) => tone(f, 0.24, 'triangle', 0.12, i * 0.13));
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
export function isMuted() { return muted; }
