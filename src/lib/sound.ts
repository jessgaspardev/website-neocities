import { readStorage, writeStorage } from "./global";

const STORAGE_KEY = "sfx";

let audioCtx: AudioContext | null = null;
let sfxEnabled = true;
let loadedFromStorage = false;

function loadFromStorage(): void {
  if (loadedFromStorage || typeof window === "undefined") return;
  loadedFromStorage = true;
  const saved = readStorage(STORAGE_KEY);
  if (saved !== null) sfxEnabled = saved === "true";
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function isSfxEnabled(): boolean {
  loadFromStorage();
  return sfxEnabled;
}

export function toggleSfx(force?: boolean): boolean {
  loadFromStorage();
  sfxEnabled = force !== undefined ? force : !sfxEnabled;
  writeStorage(STORAGE_KEY, String(sfxEnabled));
  window.dispatchEvent(new CustomEvent("sfx-change", { detail: { enabled: sfxEnabled } }));
  if (sfxEnabled) playBeep(880, 0.05, "triangle");
  return sfxEnabled;
}

export function playKeypressSound(): void {
  if (!isSfxEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  try {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(120 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.015);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.015);
  } catch {}
}

export function playBeep(
  freq: number = 440,
  duration: number = 0.08,
  type: OscillatorType = "sine",
  volume: number = 0.05,
): void {
  if (!isSfxEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  try {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch {}
}

function playSequence(freqs: number[], step: number, length: number, type: OscillatorType, volume: number): void {
  if (!isSfxEnabled()) return;
  const audio = getAudioContext();
  if (!audio) return;

  try {
    const now = audio.currentTime;
    freqs.forEach((freq, idx) => {
      const start = now + idx * step;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + length);
    });
  } catch {}
}

export function playSuccessSound(): void {
  playSequence([523.25, 659.25, 783.99], 0.04, 0.1, "sine", 0.03);
}

export function playErrorSound(): void {
  playSequence([220, 180], 0.07, 0.06, "sawtooth", 0.04);
}
