import { Platform } from 'react-native';

import { hapticLight, hapticSuccess } from '@/utils/haptics';

/**
 * A soft "ding" the passenger hears/feels at each ride milestone.
 * Native gets a haptic tap (expo-haptics is silent on web); web gets a
 * synthesized two-note chime via Web Audio — no audio asset required.
 */

let audioCtx: AudioContext | null = null;

function webChime(notes: number[]) {
  try {
    const win = window as any;
    const AC = win.AudioContext ?? win.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx ?? new AC();
    const ctx = audioCtx;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.16;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch {
    // Audio blocked or unavailable — skip silently.
  }
}

/** Play the milestone chime: driver reached the pickup, or the drop-off. */
export function playChime(kind: 'pickup' | 'dropoff') {
  if (Platform.OS === 'web') {
    // pickup: C5→E5 · dropoff: E5→B5 (a friendly rising two-note).
    webChime(kind === 'dropoff' ? [659.25, 987.77] : [523.25, 659.25]);
  } else if (kind === 'dropoff') {
    hapticSuccess();
  } else {
    hapticLight();
  }
}
