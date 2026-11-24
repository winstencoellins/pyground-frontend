import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Container, SectionHead } from "./container";
import { facts, faqs, passPrice, stages, steps, type Stage } from "./data";
import { PlaygroundDemo } from "./playground-demo";

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[20px_1fr] gap-2.5">
      <Check className="mt-1 size-4 text-primary-text" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export function Hero() {
  return (
    <section className="py-14 md:py-16">
      <Container className="grid items-center gap-9 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="grid min-w-0 gap-[22px]">
          <span className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-highlight" />
            Didukung oleh <b className="text-foreground">{brand.supportedBy}</b>
          </span>
          <h1 className="text-[clamp(2.3rem,5.4vw,3.6rem)] leading-[1.08] font-extrabold tracking-[-0.035em]">
            Belajar Python dari nol,{" "}
            <span className="relative whitespace-nowrap text-primary-text after:absolute after:inset-x-0 after:bottom-[0.02em] after:h-[0.12em] after:rounded after:bg-highlight after:content-['']">
              langsung di browser.
            </span>
          </h1>
          <p className="max-w-[34em] text-lg text-muted-foreground">
            Pelajaran berbahasa Indonesia yang bisa langsung kamu praktikkan. Tulis kode, jalankan, dan lihat hasilnya
            di halaman yang sama, dari HP maupun laptop.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-xl px-5 text-[0.95rem] font-bold">
              <a href="#harga">Mulai Tahap 1 gratis</a>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl px-5 text-[0.95rem] font-bold">
              <a href="#kurikulum">Lihat kurikulum</a>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-sm text-muted-foreground">
            {["Tanpa instalasi", "14 pelajaran pertama gratis", "Bisa di HP"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-[15px] text-primary-text" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <PlaygroundDemo />
      </Container>
    </section>
  );
}

export function Facts() {
  return (
    <section aria-label="Sekilas" className="pb-2">
      <Container>
        <dl className="grid grid-cols-2 border-y md:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "grid gap-0.5 px-5 py-[22px]",
                i % 2 === 1 && "border-l",
                i >= 2 && "border-t md:border-t-0",
                i === 2 && "md:border-l",
              )}
            >
              <dt className="sr-only">{f.label}</dt>
              <dd className="text-[1.6rem] font-extrabold tracking-tight tabular-nums">{f.value}</dd>
              <dd className="text-sm text-muted-foreground">{f.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="cara" className="scroll-mt-16 py-[72px]">
      <Container>
        <SectionHead eyebrow="Cara belajar" title="Setiap pelajaran punya tiga langkah">
          Penjelasan singkat, praktik langsung, lalu kuis kecil untuk memastikan kamu paham sebelum lanjut.
        </SectionHead>
        <ol className="grid gap-7 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="grid content-start gap-2.5">
              <span className="font-mono text-[0.8rem] font-semibold text-highlight">0{i + 1} ·</span>
              <h3 className="text-xl font-extrabold tracking-tight">{s.title}</h3>
              <p className="text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

const statusPill: Record<Stage["status"], { label: string; className: string }> = {
  free: { label: "Gratis", className: "bg-highlight text-highlight-foreground" },
  paid: { label: "Akses penuh", className: "border text-muted-foreground" },
  soon: { label: "Segera hadir", className: "bg-muted text-primary-text" },
};

export function Curriculum() {
  return (
    <section id="kurikulum" className="scroll-mt-16 pt-6 pb-[72px]">
      <Container>
        <SectionHead
          eyebrow="Kurikulum"
          title={
            <>
              Dari <code className="font-mono text-[0.9em]">print(&quot;Halo&quot;)</code> sampai membangun web
            </>
          }
        >
          Empat tahap yang tersusun berurutan. Tahap 1 gratis selamanya, tanpa perlu kartu kredit.
        </SectionHead>
        <div className="grid gap-[18px] md:grid-cols-2">
          {stages.map((s) => (
            <article
              key={s.number}
              className={cn(
                "grid min-w-0 content-start gap-3.5 rounded-[18px] border p-6",
                s.status === "soon" ? "border-dashed" : "bg-card",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
                    Tahap {s.number}
                  </span>
                  <h3 className="mt-1 text-[1.3rem] font-extrabold tracking-tight">{s.title}</h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
                    statusPill[s.status].className,
                  )}
                >
                  {statusPill[s.status].label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground tabular-nums">{s.meta}</p>
              <ul className="flex flex-wrap gap-1.5">
                {s.modules.map((m) => (
                  <li key={m} className="rounded-lg bg-muted px-2.5 py-1 text-[0.8rem]">
                    {m}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="harga" className="scroll-mt-16 pt-6 pb-[72px]">
      <Container>
        <SectionHead eyebrow="Harga" title="Mulai gratis, bayar kalau sudah yakin">
          Tidak ada langganan otomatis. Kamu beli akses 30 hari dan memperpanjang sendiri kalau masih mau belajar.
        </SectionHead>
        <div className="grid max-w-[880px] gap-[18px] md:grid-cols-2">
          <div className="grid content-start gap-[18px] rounded-[18px] border bg-card p-7">
            <h3 className="text-lg font-extrabold">Gratis</h3>
            <p className="flex items-baseline gap-1.5">
              <b className="text-[2.4rem] font-extrabold tracking-tight">Rp0</b>
              <span className="text-muted-foreground">selamanya</span>
            </p>
            <ul className="grid gap-2.5">
              <CheckItem>Seluruh Tahap 1 (14 pelajaran)</CheckItem>
              <CheckItem>Playground dan kuis</CheckItem>
              <CheckItem>Progres dan streak tersimpan</CheckItem>
            </ul>
            <Button asChild variant="outline" className="h-12 rounded-xl font-bold">
              <a href="#top">Buat akun gratis</a>
            </Button>
          </div>
          <div className="grid content-start gap-[18px] rounded-[18px] border-2 border-primary bg-card p-7">
            <h3 className="text-lg font-extrabold">Akses 30 hari</h3>
            <p className="flex items-baseline gap-1.5">
              <b className="text-[2.4rem] font-extrabold tracking-tight tabular-nums">{rupiah(passPrice)}</b>
              <span className="text-muted-foreground">/ 30 hari</span>
            </p>
            <ul className="grid gap-2.5">
              <CheckItem>Semua tahap dan pelajaran baru</CheckItem>
              <CheckItem>Semua proyek dan kuis</CheckItem>
              <CheckItem>Perpanjang lebih awal, sisa hari tidak hangus</CheckItem>
              <CheckItem>Pengingat lewat email sebelum akses berakhir</CheckItem>
            </ul>
            <Button asChild className="h-12 rounded-xl font-bold">
              <a href="#top">Beli akses</a>
            </Button>
            <p className="border-t pt-3.5 text-sm text-muted-foreground">
              Bayar dengan QRIS, GoPay, ShopeePay, transfer bank (virtual account BCA, BNI, BRI, Mandiri, Permata,
              CIMB), atau kartu kredit. Diproses oleh Midtrans.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 pt-6 pb-[72px]">
      <Container>
        <SectionHead eyebrow="FAQ" title="Pertanyaan yang sering muncul" />
        <div className="max-w-[820px] border-t">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b">
              <summary className="flex cursor-pointer list-none justify-between gap-4 px-0.5 py-[18px] text-[1.02rem] font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="font-mono text-xl leading-none text-primary-text group-open:hidden" aria-hidden>
                  +
                </span>
                <span className="hidden font-mono text-xl leading-none text-primary-text group-open:inline" aria-hidden>
                  −
                </span>
              </summary>
              <p className="max-w-[64ch] px-0.5 pb-5 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-band py-16 text-band-foreground dark:border-y">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="max-w-[18em] text-[clamp(1.6rem,3.4vw,2.2rem)] leading-tight font-extrabold tracking-tight">
            Tulis baris Python pertamamu hari ini.
          </h2>
          <p className="mt-2 text-band-muted">14 pelajaran pertama gratis. Daftar cukup dengan email.</p>
        </div>
        <Button
          asChild
          className="h-12 rounded-xl bg-white px-5 font-bold text-[#23265e] hover:bg-[#e6e7f7] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/85"
        >
          <a href="#top">Mulai Tahap 1 gratis</a>
        </Button>
      </Container>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="py-8 text-sm text-muted-foreground">
      <Container className="flex flex-wrap justify-between gap-3">
        <span>
          <b className="text-foreground">{brand.name}</b> · Didukung oleh {brand.supportedBy}
        </span>
        <span>Belajar Python dalam Bahasa Indonesia</span>
      </Container>
    </footer>
  );
}
