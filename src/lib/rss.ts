// Tiny RSS helpers for build-time feed widgets (<Goodreads>, <Letterboxd>).

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Decode HTML entities (named, decimal and hex). */
export function decode(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m);
}

/** Inner content of the first `<name>` element, with any CDATA wrapper removed. */
export function tag(xml: string, name: string) {
  const inner = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1] ?? "";
  return inner.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

/** Plain text of an HTML fragment, whitespace collapsed. */
export const text = (html: string) => decode(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();

/** Contents of each `<item>` in the feed. */
export const items = (xml: string) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
