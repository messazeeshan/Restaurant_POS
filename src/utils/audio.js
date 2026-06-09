// ============================================================
// UTILS — AUDIO (Web Audio API tones, no audio files)
// ============================================================

import { STORAGE_KEYS } from '../data/constants.js';

let audioCtx = null;
let audioEnabled = true;
let audioInitialized = false;

// Load persisted preference
try {
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED);
  if (stored !== null) audioEnabled = JSON.parse(stored);
} catch {}

/**
 * Must be called on a user gesture to unlock AudioContext.
 */
export function initAudio() {
  if (audioInitialized) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioInitialized = true;
  } catch {}
}

export function isAudioInitialized() {
  return audioInitialized;
}

export function isAudioEnabled() {
  return audioEnabled;
}

export function setAudioEnabled(val) {
  audioEnabled = val;
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, JSON.stringify(val));
  } catch {}
}

function playTone(frequency, delaySeconds, durationSeconds) {
  if (!audioCtx || !audioEnabled) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + delaySeconds);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delaySeconds);
    gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + delaySeconds + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delaySeconds + durationSeconds);

    osc.start(audioCtx.currentTime + delaySeconds);
    osc.stop(audioCtx.currentTime + delaySeconds + durationSeconds + 0.05);
  } catch {}
}

/**
 * Friendly double-chime: new order arrived at KDS / pending orders dashboard.
 */
export function playNewOrderTone() {
  playTone(523, 0.0, 0.15);  // C5
  playTone(659, 0.2, 0.15);  // E5
  playTone(784, 0.4, 0.22);  // G5
}

/**
 * Urgent rapid triple beep: SLA breach alert.
 */
export function playSLAAlertTone() {
  playTone(880,  0.00, 0.12); // A5
  playTone(880,  0.16, 0.12); // A5
  playTone(880,  0.32, 0.12); // A5
  playTone(1047, 0.52, 0.25); // C6 — rising urgency
}
