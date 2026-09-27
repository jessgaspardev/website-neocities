/**
 * Components publish small JS APIs on `window.retroUI` so they can be
 * driven from anywhere (e.g. `window.retroUI.radio.open()`).
 */
export function expose(key: string, api: object): void {
  const w = window as unknown as { retroUI?: Record<string, object> };
  w.retroUI = w.retroUI || {};
  w.retroUI[key] = api;
}

/** Safe localStorage helpers (private mode / blocked storage never throw). */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
