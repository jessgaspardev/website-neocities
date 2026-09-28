export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  url: string;
  duration?: string; 
  type?: "mp3" | "youtube";
  youtubeId?: string;
  isCustom?: boolean;
}

export const DEFAULT_TRACKS: RadioTrack[] = [
  {
    id: "track-1",
    title: "Lofi Hip Hop Radio 24/7 🔴 LIVE",
    artist: "Lofi Girl",
    genre: "Lo-Fi",
    url: "https://www.youtube.com/watch?v=rFZHOHl-L8A",
    type: "youtube",
    youtubeId: "rFZHOHl-L8A",
    duration: "LIVE",
  },
  {
    id: "track-2",
    title: "Synthwave Radio 24/7 🔴 LIVE",
    artist: "Lofi Girl Synthwave",
    genre: "Synthwave",
    url: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    type: "youtube",
    youtubeId: "4xDzrJKXOOY",
    duration: "LIVE",
  },
  {
    id: "track-3",
    title: "Chillhop Radio 24/7 🔴 LIVE",
    artist: "Chillhop Music",
    genre: "Lo-Fi",
    url: "https://www.youtube.com/watch?v=5yx6BWlEVcY",
    type: "youtube",
    youtubeId: "5yx6BWlEVcY",
    duration: "LIVE",
  },
];
