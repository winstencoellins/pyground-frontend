/**
 * Pages that need a signed-in user (paths without the locale prefix). Lessons are not here on purpose:
 * free lessons are public, and the API decides which lessons need a pass.
 */
export const PROTECTED_PREFIXES = ["/dashboard", "/billing", "/payment", "/account", "/admin"] as const;

export function isProtected(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}
