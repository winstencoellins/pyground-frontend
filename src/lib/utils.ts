export { cn } from "cn";

/** Fills "{name}" placeholders in a message passed to a client component as a plain string. */
export const fill = (s: string, values: Record<string, number | string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(values[k]));
