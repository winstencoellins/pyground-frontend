/** Message keys under Auth.errors. */
export type AuthErrorKey =
  | "INVALID_EMAIL_OR_PASSWORD"
  | "USER_ALREADY_EXISTS"
  | "INVALID_EMAIL"
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_LONG"
  | "INVALID_TOKEN"
  | "INVALID_PASSWORD"
  | "INVALID_NAME"
  | "RATE_LIMITED"
  | "NETWORK"
  | "UNKNOWN";

const known = new Set<string>([
  "INVALID_EMAIL_OR_PASSWORD",
  "USER_ALREADY_EXISTS",
  "INVALID_EMAIL",
  "PASSWORD_TOO_SHORT",
  "PASSWORD_TOO_LONG",
  "INVALID_TOKEN",
  "INVALID_PASSWORD",
  "INVALID_NAME",
]);

type ClientError = { code?: string; status?: number; error?: { code?: string } };

/**
 * Maps a Better Auth client error to a translated message key. pyground-api wraps every error as
 * { error: { code, message } }, so the code is nested; plain Better Auth puts it at the top level.
 */
export function authErrorKey(error: ClientError | null | undefined): AuthErrorKey {
  if (!error) return "UNKNOWN";
  if (error.status === 429) return "RATE_LIMITED";
  if (!error.status) return "NETWORK";
  const raw = error.error?.code ?? error.code;
  const code = raw === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ? "USER_ALREADY_EXISTS" : raw;
  return code && known.has(code) ? (code as AuthErrorKey) : "UNKNOWN";
}
