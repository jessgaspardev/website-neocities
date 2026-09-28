export interface CollabItem {
  id: string;
  partner: string;
  partnerType: "Open Source Org" | "Startup" | "Tech Studio" | "Research Team";
  title: string;
  role: string;
  period: string;
  description: string;
  contributions: string[];
  techStack: string[];
  link?: string;
  status: "ACTIVE" | "COMPLETED" | "ONGOING";
  asciiLogo?: string;
}

export interface SkillCategory {
  category: string;
  icon: string;
  skills: { name: string; level: number; experience: string; tag: string }[];
}

export type Max8Colors =
  | []
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string]
  | [string, string, string, string, string, string]
  | [string, string, string, string, string, string, string]
  | [string, string, string, string, string, string, string, string];

export const PORTFOLIO_DATA = {
  developer: {
    name: "Jess Gaspar",
    handle: "jessgaspar.dev",
    title: "Web Designer & Developer",
    alias: "jess@neocities",
    email: "jessgaspardev@gmail.com",
    github: "https://github.com/jessgaspardev",
    twitter: "https://x.com/jsgaspardev",
    bluesky: "https://bsky.app/profile/jessgaspar.dev",
    neocities: "https://neocities.org/site/jessgaspardev",
    letterboxd: "https://letterboxd.com/amandaseyfrieds",
    steam: "https://steamcommunity.com/id/cirillas/",
    location: "Portugal",
    status: " OPEN FOR COLLABORATIONS",
    CLI_EMOJI: "🫐",
    palette: [
      "#0f0f0f",
      "#ef4444",
      "#22c55e",
      "#eab308",
      "#3b82f6",
      "#a855f7",
      "#06b6d4",
      "#f8fafc",
    ],
    bio: "Independent web designer and developer with 5+ years of experience.",
    quote:
      '"It aint much but it\'s honest work"',
    asciiBanner: `
    _                                                   _
   (_) ___  ___ ___  __ _  __ _ ___ _ __   __ _ _ __ __| | _____   __
   | |/ _ \\/ __/ __|/ _\` |/ _\` / __| '_ \\ / _\` | '__/ _\` |/ _ \\ \\ / /
   | |  __/\\__ \\__ \\ (_| | (_| \\__ \\ |_) | (_| | |_| (_| |  __/\\ V /
  _/ |\\___||___/___/\\__, |\\__,_|___/ .__/ \\__,_|_(_)\\__,_|\\___| \\_/
 |__/               |___/          |_|
`,
    specs: {
      name: "jess",
      pronouns: "she/her",
      languages: "english, portuguese",
      likes: "coding, gaming, art, books, movies, basketball",
      techstack: "astro, laravel, svelte",
      editor: "visual studio code",
    },
  },
};
