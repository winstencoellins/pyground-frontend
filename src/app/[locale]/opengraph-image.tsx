import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { routing } from "@/i18n/routing";

// Share card for every page under /[locale] (link previews on WhatsApp, X, Facebook…). Nila & Merah palette.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pyground";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : "id";
  const [hero, common] = await Promise.all([
    getTranslations({ locale, namespace: "Hero" }),
    getTranslations({ locale, namespace: "Common" }),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #0a1f1c 0%, #0f5f58 55%, #3f6212 100%)",
          color: "#ecfdf5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 999,
              background: "#ecfdf5",
              color: "#0a1f1c",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            py
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{brand.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{hero("title")}</div>
          <div style={{ fontSize: 32, color: "#b5d6cf", lineHeight: 1.35, maxWidth: 940 }}>{hero("body")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#b5d6cf" }}>
          <div style={{ width: 40, height: 6, borderRadius: 3, background: "#a3e635" }} />
          {common("supportedBy", { name: brand.supportedBy })}
        </div>
      </div>
    ),
    size,
  );
}
