import { cacheLife } from "next/cache";
import { connection } from "next/server";

/** The access pass price in Rupiah from the API (the same config checkout charges). Cached for hours. */
async function fetchPassPrice() {
  "use cache";
  cacheLife("hours");
  const res = await fetch(`${process.env.API_URL ?? "http://localhost:3001"}/api/payments/pass`);
  const price = res.ok ? ((await res.json()) as { price?: unknown }).price : undefined;
  // Throwing (not returning null) so a failure isn't cached; the caller falls back.
  if (!Number.isInteger(price)) throw new Error(`pass price unavailable (${res.status})`);
  return price as number;
}

/**
 * Rendered per request, not at build time: the API isn't reachable while the web app builds (e.g. Railway's
 * private network). Wrap in <Suspense>; the landing page shell stays static.
 */
export async function PassPrice({ locale, fallback }: { locale: string; fallback: string }) {
  await connection();
  const price = await fetchPassPrice().catch((e) => {
    console.error(e);
    return null;
  });
  if (price === null) return <span className="text-[1.4rem]">{fallback}</span>;
  return <>Rp{price.toLocaleString(locale === "id" ? "id-ID" : "en-US")}</>;
}
