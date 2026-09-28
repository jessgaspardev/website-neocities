export function expose(key: string, api: object): void {
  const w = window as unknown as { retroUI?: Record<string, object> };
  w.retroUI = w.retroUI || {};
  w.retroUI[key] = api;
}

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
