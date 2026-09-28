export interface SteamGame {
  name: string;
  hours: string;
}

const WORKER_URL = "https://api.strawberryjam.workers.dev/api";

export async function fetchSteamGame(kind: "lastplayed" | "mostplayed", steamId: string): Promise<SteamGame | null> {
  if (!steamId) return null;
  try {
    const res = await fetch(`${WORKER_URL}/steam-${kind}?steamid=${encodeURIComponent(steamId)}`);
    const data = await res.json();
    return data?.name ? { name: data.name, hours: String(data.hours ?? "") } : null;
  } catch {
    return null;
  }
}

const iconCache: Record<string, string> = {};

export async function fetchGameArtByName(gameName: string, rawgKey: string): Promise<string> {
  const key = gameName.toLowerCase().trim();
  if (!key || !rawgKey) return "";
  if (iconCache[key]) return iconCache[key];
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(gameName)}&key=${rawgKey}&page_size=1`,
    );
    const data = await res.json();
    const img = data.results?.[0]?.background_image || "";
    if (img) iconCache[key] = img;
    return img;
  } catch {
    return "";
  }
}
