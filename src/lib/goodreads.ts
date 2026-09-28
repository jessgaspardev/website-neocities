import { items, tag, text } from "./rss";

export interface GoodreadsUpdate {
  action: string;
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

  const lead = text(html.slice(0, book.index).replace(/^[\s\S]*<\/a>/, ""));
  const verb = lead.replace(/^\S+\s+/, "").replace(/^is\s+/, "");
  const stars = verb.match(/^gave (\d) stars? to$/);

  return {
    action: stars ? "rated" : verb,
    rating: stars ? Number(stars[1]) : undefined,
    title: text(book[2]).replace(/\s*\((?:Paperback|Hardcover|Kindle Edition|ebook|Mass Market Paperback)\)$/i, ""),
    author: text(html.match(/class="authorName"[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? ""),
    cover: (html.match(/<img[^>]*src="([^"]*)"/)?.[1] ?? "").replace(/\._S[XY]\d+_\./, "._SY160_."),
    href: absolute(book[1]),
    date: new Date(tag(item, "pubDate")),
  };
}

export async function fetchGoodreadsUpdates(userId: string, limit = 3): Promise<GoodreadsUpdate[]> {
  try {
    const res = await fetch(`${BASE_URL}/user/updates_rss/${userId}`);
    if (!res.ok) return [];
    const seen = new Set<string>();
    const updates: GoodreadsUpdate[] = [];
    for (const item of items(await res.text())) {
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
