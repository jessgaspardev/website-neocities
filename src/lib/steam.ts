// Steam playtime stats via the strawberrysnails steam-widgets worker
// (https://strawberrysnails.github.io/steam-widgets/), which proxies the
// Steam Web API so no API key is needed client-side. Used by <GameActivity>.

export interface SteamGame {
  name: string;
  /** Total playtime in hours, e.g. "33.4". */
  hours: string;
}

const WORKER_URL = "https://api.strawberryjam.workers.dev/api";

/** Last played or most played game for a public Steam profile, or null. */
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

/** Look up cover art by game name on RAWG (needs your own free API key). */
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
