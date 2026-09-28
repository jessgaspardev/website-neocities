export type Tone =
  | "fg"
  | "dim"
  | "bright"
  | "accent"
  | "accent-2"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "cyan"
  | "purple"
  | "pink"
  | "idle";

export function toneVar(tone: Tone): string {
  if (tone === "dim") return "var(--fg-dim)";
  if (tone === "bright") return "var(--fg-bright)";
  return `var(--${tone})`;
}

export function spaceVar(step: number): string {
  return step === 0 ? "0" : `var(--space-${step})`;
}

export function mergeStyle(vars: string, style: unknown): string {
  if (!style) return vars;
  if (typeof style === "string") return `${vars};${style}`;
  const declarations = Object.entries(style as Record<string, unknown>)
    .map(([key, value]) => `${key.startsWith("--") ? key : key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${value}`)
    .join(";");
  return `${vars};${declarations}`;
}
