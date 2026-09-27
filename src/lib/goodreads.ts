// Goodreads reading updates, read from a user's public updates RSS feed.
// Goodreads sends no CORS headers, so this runs at build time only (in
// component frontmatter) and the result is baked into the static HTML.
// Used by <Goodreads>.

import { items, tag, text } from "./rss";

export interface GoodreadsUpdate {
  /** What happened, e.g. "currently reading", "added", "rated". */
  action: string;
  /** 1–5 when the update is a star rating. */
  rating?: number;
  title: string;
  author: string;
  cover: string;
  href: string;
  date: Date;
}

const BASE_URL = "https://www.goodreads.com";

const absolute = (href: string) => (href.startsWith("/") ? BASE_URL + href : href);

function parseItem(item: string): GoodreadsUpdate | null {
  const html = tag(item, "description");
  const book = html.match(/<a[^>]*class="bookTitle"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
  if (!book) return null;

  // Text between the cover link and the book title, e.g. "Jess is currently reading".
  const lead = text(html.slice(0, book.index).replace(/^[\s\S]*<\/a>/, ""));
  const verb = lead.replace(/^\S+\s+/, "").replace(/^is\s+/, "");
  const stars = verb.match(/^gave (\d) stars? to$/);

  return {
    action: stars ? "rated" : verb,
    rating: stars ? Number(stars[1]) : undefined,
    // Drop the edition suffix Goodreads adds to rated books, e.g. "(Paperback)".
    title: text(book[2]).replace(/\s*\((?:Paperback|Hardcover|Kindle Edition|ebook|Mass Market Paperback)\)$/i, ""),
    author: text(html.match(/class="authorName"[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? ""),
    // Covers come as tiny thumbnails (_SX50_ / _SY75_); ask for a sharper one.
    cover: (html.match(/<img[^>]*src="([^"]*)"/)?.[1] ?? "").replace(/\._S[XY]\d+_\./, "._SY160_."),
    href: absolute(book[1]),
    date: new Date(tag(item, "pubDate")),
  };
}

/** Most recent book updates for a Goodreads user, newest first. Empty on failure. */
export async function fetchGoodreadsUpdates(userId: string, limit = 3): Promise<GoodreadsUpdate[]> {
  try {
    const res = await fetch(`${BASE_URL}/user/updates_rss/${userId}`);
    if (!res.ok) return [];
    const seen = new Set<string>();
    const updates: GoodreadsUpdate[] = [];
    for (const item of items(await res.text())) {
      // The feed repeats some updates verbatim; skip those.
      const guid = tag(item, "guid");
      if (seen.has(guid)) continue;
      seen.add(guid);
      const update = parseItem(item);
      if (update) updates.push(update);
      if (updates.length >= limit) break;
    }
    return updates;
  } catch {
    return [];
  }
}
