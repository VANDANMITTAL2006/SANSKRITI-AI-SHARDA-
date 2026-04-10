import { Coordinates } from "@/types";

type TourStepConfig = {
  easing?: number;
  curveScale?: number;
  jitterScale?: number;
  curveFrequency?: number;
};

export function nextTourPosition(
  current: Coordinates,
  target: Coordinates,
  tick: number,
  config: TourStepConfig = {},
): Coordinates {
  const easing = config.easing ?? 0.08;
  const curveScale = config.curveScale ?? 0.000012;
  const jitterScale = config.jitterScale ?? 0.000006;
  const curveFrequency = config.curveFrequency ?? 10;

  const latDelta = target.lat - current.lat;
  const lngDelta = target.lng - current.lng;
  const mag = Math.hypot(latDelta, lngDelta) || 1;

  const unitLat = latDelta / mag;
  const unitLng = lngDelta / mag;
  const perpLat = -unitLng;
  const perpLng = unitLat;

  const proximity = Math.min(1, mag / 0.0006);
  const curve = Math.sin(tick / curveFrequency) * curveScale * proximity;
  const jitterLat = (Math.random() - 0.5) * jitterScale * proximity;
  const jitterLng = (Math.random() - 0.5) * jitterScale * proximity;

  return {
    lat: current.lat + latDelta * easing + perpLat * curve + jitterLat,
    lng: current.lng + lngDelta * easing + perpLng * curve + jitterLng,
  };
}

export async function playTourCue() {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  const gain = ctx.createGain();

  oscA.type = "sine";
  oscA.frequency.setValueAtTime(659.25, now);
  oscB.type = "sine";
  oscB.frequency.setValueAtTime(987.77, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

  oscA.connect(gain);
  oscB.connect(gain);
  gain.connect(ctx.destination);

  oscA.start(now);
  oscB.start(now + 0.12);
  oscA.stop(now + 0.38);
  oscB.stop(now + 0.38);

  await new Promise<void>((resolve) => {
    oscB.onended = () => resolve();
  });

  await ctx.close();
}

export function waitMs(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}