import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client. No baseURL: it calls /api/auth on this origin, which the /api rewrite sends to pyground-api.
 * The extra user fields mirror additionalFields in pyground-backend/src/lib/auth.ts.
 */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false, input: false },
        accessUntil: { type: "date", required: false, input: false },
        locale: { type: "string", required: false, input: true },
      },
    }),
  ],
});

export const { useSession, signOut } = authClient;

export { AFTER_AUTH_PATH, safeNext } from "./safe-next";
