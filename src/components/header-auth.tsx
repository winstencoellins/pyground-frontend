"use client";

import { LogOut } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "@/lib/auth-client";

type Labels = { signIn: string; start: string; signOut: string };

/** Header buttons: sign in / start free when signed out, name + sign out when signed in. */
export function HeaderAuth({ labels }: { labels: Labels }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (session) {
    const first = session.user.name.split(" ")[0];
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[10rem] truncate text-[0.9rem] font-semibold lg:block">{first}</span>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.88rem] font-semibold outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50"
        >
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">{labels.signOut}</span>
        </button>
      </div>
    );
  }

  return (
    // While the session loads, the signed-out buttons show (most visitors are signed out).
    <div className="flex items-center gap-2" aria-busy={isPending}>
      <Link href="/sign-in" className="hidden px-1.5 text-[0.9rem] font-semibold lg:block">
        {labels.signIn}
      </Link>
      <Link
        href="/sign-up"
        className="hidden h-10 items-center rounded-full bg-foreground px-4 text-[0.88rem] font-semibold text-background outline-none focus-visible:ring-4 focus-visible:ring-ring/50 sm:inline-flex"
      >
        {labels.start}
      </Link>
    </div>
  );
}
