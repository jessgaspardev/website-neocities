import { decode, items, tag } from "./rss";

export interface LetterboxdFilm {
  title: string;
  year: string;
  rating?: number;
  liked: boolean;
  rewatch: boolean;
  poster: string;
  href: string;
  watched: Date;
}

export async function fetchLetterboxdFilms(username: string, limit = 3): Promise<LetterboxdFilm[]> {
  try {
    const res = await fetch(`https://letterboxd.com/${username}/rss/`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PersonalSiteBuild/1.0)" },
    });
    if (!res.ok) return [];
    const films: LetterboxdFilm[] = [];
    for (const item of items(await res.text())) {
      const title = tag(item, "letterboxd:filmTitle");
      if (!title) continue;
      const rating = Number(tag(item, "letterboxd:memberRating"));
      const [y, m, d] = tag(item, "letterboxd:watchedDate").split("-").map(Number);
      films.push({
        title: decode(title),
        year: tag(item, "letterboxd:filmYear"),
        rating: rating > 0 ? rating : undefined,
        liked: tag(item, "letterboxd:memberLike") === "Yes",
        rewatch: tag(item, "letterboxd:rewatch") === "Yes",
        poster: (tag(item, "description").match(/<img[^>]*src="([^"]*)"/)?.[1] ?? "").replace(
          "-0-600-0-900-",
          "-0-150-0-225-",
        ),
        href: tag(item, "link"),
        watched: y ? new Date(y, m - 1, d) : new Date(tag(item, "pubDate")),
      });
      if (films.length >= limit) break;
    }
    return films;
  } catch {
    return [];
  }
}
