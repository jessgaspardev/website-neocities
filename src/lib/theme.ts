// Theme registry for <ThemeSelect>. The colors themselves live in
// styles/tokens.css — this file only lists which themes exist.

import { readStorage, writeStorage } from "./global";

export interface RetroTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME = "fruity";

export const THEMES: RetroTheme[] = [
  { id: "fruity", name: "Fruity Code", emoji: "🩷", description: "Bright code editor theme glow" },
  { id: "green", name: "Phosphor Green", emoji: "🟢", description: "1980s green CRT monitor phosphor glow" },
  { id: "amber", name: "Amber CRT", emoji: "🟠", description: "VT100 & IBM mainframe amber phosphor glow" },
  { id: "cyan", name: "Cyber Cyan", emoji: "🔵", description: "High-contrast electric cyan & hot pink neon" },
  { id: "dracula", name: "Dracula Synth", emoji: "🟣", description: "Dark synthwave purple & pastel green" },
  { id: "mono", name: "Monochrome", emoji: "⚪", description: "Minimalist high-contrast monochrome paper" },
  { id: "cappuccino", name: "Cappuccino", emoji: "☕", description: "Warm espresso brown & creamy caramel CRT glow" },
];

export function getTheme(): string {
  return document.documentElement.getAttribute("data-theme") || readStorage(THEME_STORAGE_KEY) || DEFAULT_THEME;
}

export function setTheme(id: string, persist: boolean = true): void {
  document.documentElement.setAttribute("data-theme", id);
  if (persist) writeStorage(THEME_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: id } }));
}
