// CRT screen effect state. The overlay markup and CSS live in
// components/effects/CRT.astro; this module switches it on/off and
// changes its strength by writing CSS variables on <html>.

import { readStorage, writeStorage } from "./global";

export type CRTIntensity = "low" | "medium" | "high" | "ultra";

export const CRT_PRESETS: Record<CRTIntensity, { scanline: number; vignette: number; label: string }> = {
  low: { scanline: 0.1, vignette: 0.35, label: "LOW" },
  medium: { scanline: 0.22, vignette: 0.65, label: "MEDIUM" },
  high: { scanline: 0.4, vignette: 0.85, label: "HIGH" },
  ultra: { scanline: 0.65, vignette: 0.98, label: "ULTRA" },
};

export const CRT_STORAGE_KEY = "crt";
export const CRT_INTENSITY_STORAGE_KEY = "crt-intensity";

export interface CRTState {
  enabled: boolean;
  intensity: CRTIntensity;
}

export function getCRTState(): CRTState {
  const root = document.documentElement;
  return {
    enabled: root.getAttribute("data-crt") !== "off",
    intensity: (root.getAttribute("data-crt-intensity") as CRTIntensity) || "medium",
  };
}

/** Updates the CRT effect. Fires `crt-change` on window. */
export function setCRT(next: Partial<CRTState>, persist: boolean = true): CRTState {
  const root = document.documentElement;
  const state = { ...getCRTState(), ...next };
  const preset = CRT_PRESETS[state.intensity] || CRT_PRESETS.medium;

  root.setAttribute("data-crt", state.enabled ? "on" : "off");
  root.setAttribute("data-crt-intensity", state.intensity);
  root.style.setProperty("--scanline-opacity", String(preset.scanline));
  root.style.setProperty("--vignette-opacity", String(preset.vignette));

  if (persist) {
    writeStorage(CRT_STORAGE_KEY, String(state.enabled));
    writeStorage(CRT_INTENSITY_STORAGE_KEY, state.intensity);
  }

  window.dispatchEvent(new CustomEvent("crt-change", { detail: state }));
  return state;
}

export function toggleCRT(): CRTState {
  return setCRT({ enabled: !getCRTState().enabled });
}

export function savedCRTState(): Partial<CRTState> {
  const enabled = readStorage(CRT_STORAGE_KEY);
  const intensity = readStorage(CRT_INTENSITY_STORAGE_KEY) as CRTIntensity | null;
  return {
    ...(enabled !== null ? { enabled: enabled === "true" } : {}),
    ...(intensity && intensity in CRT_PRESETS ? { intensity } : {}),
  };
}
