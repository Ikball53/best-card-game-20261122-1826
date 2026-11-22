// Emberfall Clash — tiny WebAudio bleeps, one per event, with a mute switch.
let audioCtx = null;
let muted = false;

export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; return muted; }

function ensureContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function blip(freq, dur, type = "sine", gain = 0.08, when = 0) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export function playDrawSound() { blip(660, 0.08, "triangle"); }
export function playPickSound() { blip(880, 0.06, "sine"); }
export function playClashSound() { blip(180, 0.16, "sawtooth", 0.1); blip(120, 0.2, "square", 0.06, 0.05); }
export function playHurtSound() { blip(140, 0.22, "sawtooth", 0.09); }
export function playWinSound() { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.18, "triangle", 0.09, i * 0.11)); }
export function playLoseSound() { [392, 330, 262, 196].forEach((f, i) => blip(f, 0.2, "triangle", 0.09, i * 0.12)); }
export function playDealSound() { blip(440, 0.05, "triangle", 0.05); }
