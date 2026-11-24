import { Check, Flame, Languages, ListChecks, Play, Terminal } from "lucide-react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { DashboardMock } from "./dashboard-mock";
import { faqs, features, passPrice, stages, topics, type Stage } from "./data";
import { LearnTicker } from "./learn-ticker";
import { PlaygroundDemo } from "./playground-demo";
import { Chip, Container, OutlinePill, PillLink, SectionTitle } from "./ui";

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

/* ---------------------------------------------------------------- hero */

export function Hero() {
  return (
    <section className="relative overflow-x-clip pt-12 pb-16 lg:pt-16">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
        {/* left: pitch */}
        <div className="grid min-w-0 content-center gap-6">
          <Chip tag="Gratis">Tahap 1 untuk semua</Chip>
          <h1 className="text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.04em]">
            Belajar Python dari nol
          </h1>
          <p className="max-w-[30em] text-[1.05rem] leading-relaxed text-muted-foreground">
            Pelajaran singkat berbahasa Indonesia yang bisa langsung kamu praktikkan. Tulis kode, jalankan, dan lihat
            hasilnya di halaman yang sama.
          </p>
          <PillLink href="#harga">Mulai belajar gratis</PillLink>
          <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
            {["14 pelajaran pertama gratis", "Tanpa instalasi, bisa di HP", `Didukung oleh ${brand.supportedBy}`].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-highlight" aria-hidden />
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* center: the product itself, on a soft glow */}
        <div className="relative min-w-0">
          <div
            aria-hidden
            className="absolute inset-x-[-10%] top-[8%] bottom-[-6%] -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--primary)_22%,transparent),transparent)] blur-2xl"
          />
          <PlaygroundDemo />
        </div>

        {/* right: floating cards + statement */}
        <div className="grid min-w-0 content-between gap-8 lg:self-stretch lg:py-2">
          <LearnTicker />
          <div className="grid gap-5">
            <div className="rounded-2xl border bg-card p-4 shadow-[0_18px_40px_-24px_rgb(27_29_58/0.45)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.8rem] text-muted-foreground">Progres Tahap 1</p>
                <p className="text-[1.7rem] leading-none font-semibold tracking-tight tabular-nums">64%</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[64%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 flex items-center justify-end gap-1 text-[0.75rem] font-semibold text-highlight">
                <Flame className="size-3.5" aria-hidden /> Streak 5 hari
              </p>
            </div>
            <p className="text-[clamp(1.7rem,2.6vw,2.2rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
              Kodemu jalan. Tanpa install.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- topic strip */

export function TopicStrip() {
  return (
    <section aria-labelledby="topics-h" className="pb-20">
      <Container className="grid justify-items-center gap-4">
        <p id="topics-h" className="text-[0.72rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Yang akan kamu kuasai
        </p>
        <ul className="grid w-full max-w-[860px] grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4 md:grid-cols-7">
          {topics.map((t) => (
            <li
              key={t}
              className="flex items-center justify-center gap-2 border-r border-b px-3 py-3.5 text-[0.85rem] font-semibold whitespace-nowrap md:border-b-0 md:last:border-r-0"
            >
              <Terminal className="size-3.5 shrink-0 text-primary-text" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- why */

const featureIcon = { play: Play, languages: Languages, "list-checks": ListChecks, flame: Flame } as const;
const iconTint = [
  "bg-primary/10 text-primary-text",
  "bg-highlight/10 text-highlight",
  "bg-primary/10 text-primary-text",
  "bg-highlight/10 text-highlight",
];

export function Why() {
  return (
    <section id="cara" className="scroll-mt-20 py-16">
      <Container>
        <SectionTitle
          center
          tag="Kenapa"
          label="Kenapa Pyground"
          title={
            <>
              Bukan sekadar nonton.
              <br />
              Kamu benar-benar ngoding.
            </>
          }
        >
          Setiap pelajaran berisi penjelasan singkat, contoh yang bisa kamu jalankan, dan kuis kecil. Belajar sambil
          praktik, sedikit demi sedikit.
        </SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = featureIcon[f.icon];
            return (
              <article key={f.title} className="grid content-start gap-14 rounded-[20px] border bg-card p-5">
                <span className={cn("grid size-11 place-items-center rounded-xl", iconTint[i])}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="grid gap-1.5">
                  <h3 className="text-[1.05rem] font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- product overview */

export function Overview() {
  return (
    <section className="overflow-x-clip py-16">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-7">
          <SectionTitle tag="Dashboard" label="Ruang belajarmu" title="Semua progresmu, di satu tempat">
            Lanjutkan pelajaran terakhir dengan satu klik, lihat progres setiap tahap, dan jaga streak harianmu.
          </SectionTitle>
          <PillLink href="#harga">Coba gratis sekarang</PillLink>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.88rem]">
            {["Lanjutkan dari terakhir", "Progres per tahap", "Streak harian"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid size-4 place-items-center rounded-full bg-highlight text-highlight-foreground">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        {/* Bleeds past the right edge on wide screens; scrolls sideways inside its own box on phones. */}
        <div className="-mr-4 overflow-x-auto pb-4 sm:-mr-6 lg:overflow-visible lg:pb-0">
          <DashboardMock />
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- stages */

function Shape({ kind }: { kind: Stage["shape"] }) {
  const base = "drop-shadow-[0_18px_18px_rgb(27_29_58/0.25)]";
  if (kind === "sphere")
    return (
      <div
        className={cn(base, "size-24 rounded-full")}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #fff 0 8%, color-mix(in srgb, var(--primary) 35%, #fff) 30%, var(--primary) 78%)",
        }}
      />
    );
  if (kind === "ring")
    return (
      <div
        className={cn(base, "size-24 rounded-full border-[16px]")}
        style={{
          borderColor: "color-mix(in srgb, var(--primary) 70%, #fff)",
          transform: "perspective(240px) rotateX(55deg) rotateZ(-20deg)",
          boxShadow: "inset 0 6px 10px rgb(255 255 255 / 0.6)",
        }}
      />
    );
  if (kind === "blocks")
    return (
      <div className={cn(base, "grid grid-cols-3 gap-1.5")}>
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="size-7 rounded-md"
            style={{
              background: `color-mix(in srgb, var(--primary) ${30 + ((i * 37) % 60)}%, #fff)`,
              boxShadow: "inset 0 1px 2px rgb(255 255 255 / 0.7)",
            }}
          />
        ))}
      </div>
    );
  return (
    <div
      className={cn(base, "h-24 w-28")}
      style={{
        clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
        background:
          "linear-gradient(120deg, color-mix(in srgb, var(--primary) 30%, #fff), var(--primary) 55%, var(--highlight))",
      }}
    />
  );
}

const stageStatus: Record<Stage["status"], { label: string; className: string }> = {
  free: { label: "Gratis", className: "bg-highlight text-highlight-foreground" },
  paid: { label: "Akses penuh", className: "border text-muted-foreground" },
  soon: { label: "Segera hadir", className: "bg-muted text-primary-text" },
};

export function Stages() {
  return (
    <section id="kurikulum" className="scroll-mt-20 py-16">
      <Container>
        <SectionTitle tag="Kurikulum" label="Empat tahap" title="Dari print pertama sampai membangun web">
          Materi tersusun berurutan. Kamu tahu persis apa yang dipelajari selanjutnya.
        </SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start lg:[--stagger:14px]">
          {stages.map((s, i) => (
            <article
              key={s.number}
              className="grid gap-4 rounded-[20px] border bg-card p-5"
              style={{ marginTop: `calc(var(--stagger, 0px) * ${i})` }}
            >
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Tahap {s.number}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap",
                      stageStatus[s.status].className,
                    )}
                  >
                    {stageStatus[s.status].label}
                  </span>
                </div>
                <h3 className="text-[1.15rem] font-semibold tracking-tight">{s.title}</h3>
                <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{s.summary}</p>
              </div>
              <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-muted bg-[radial-gradient(circle_at_50%_35%,var(--card),var(--muted))]">
                <Shape kind={s.shape} />
              </div>
              <p className="text-[0.82rem] text-muted-foreground tabular-nums">{s.meta}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- showcase (in place of a testimonial) */

export function Showcase() {
  return (
    <section className="py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.6fr)]">
        <div className="overflow-hidden rounded-[20px] bg-[#15172f] p-5 font-mono text-[0.78rem] leading-relaxed text-[#d9dbf5] shadow-[0_30px_60px_-30px_rgb(27_29_58/0.6)]">
          <p className="mb-3 flex items-center gap-2 font-sans text-[0.72rem] font-semibold tracking-[0.08em] text-[#a0a3c6] uppercase">
            <span className="size-2 rounded-full bg-[#ff7a6b]" /> Proyek Tahap 3
          </p>
          <pre className="whitespace-pre-wrap">
            {[
              "$ python pengeluaran.py",
              "+ 2026-11-20  makan     Rp 25.000",
              "+ 2026-11-21  transport Rp 18.000",
              "+ 2026-11-22  kos       Rp 850.000",
              "",
              "Total bulan ini: Rp 893.000",
              "Tersimpan ke pengeluaran.json",
            ].join("\n")}
          </pre>
        </div>
        <div className="grid gap-5">
          <Chip tag="Proyek">Belajar dengan membangun</Chip>
          <p className="text-[clamp(1.3rem,2.2vw,1.65rem)] leading-snug font-semibold tracking-[-0.02em]">
            Setiap tahap ditutup dengan proyek nyata: program kasir warung, buku nilai siswa, sampai pencatat
            pengeluaran yang menyimpan data ke file dan diuji dengan pytest.
          </p>
          <p className="text-[0.9rem] text-muted-foreground">Kasir Warung · Buku Nilai Siswa · Pencatat Pengeluaran</p>
        </div>
        <dl className="grid grid-cols-3 gap-6 lg:grid-cols-1">
          {[
            ["61", "pelajaran interaktif"],
            ["15+ jam", "materi belajar"],
            ["ID · EN", "dua bahasa"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-tight tabular-nums">{v}</dd>
              <dd className="text-[0.85rem] text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- pricing */

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Check className="mt-1 size-4 shrink-0 text-highlight" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export function Pricing() {
  return (
    <section id="harga" className="scroll-mt-20 py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle tag="Harga" label="Tanpa langganan otomatis" title="Mulai gratis, bayar kalau sudah yakin">
            Beli akses 30 hari dan perpanjang sendiri kalau masih mau belajar.
          </SectionTitle>
          <p className="rounded-full border bg-card px-4 py-2 text-[0.8rem] text-muted-foreground">
            QRIS · GoPay · ShopeePay · Transfer bank · Kartu kredit
          </p>
        </div>
        <div className="mt-12 grid max-w-[860px] items-start gap-5 md:grid-cols-2">
          <div className="grid gap-6 rounded-[22px] border bg-card p-7 md:mt-8">
            <div>
              <h3 className="font-semibold">Gratis</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <b className="text-[2.6rem] leading-none font-semibold tracking-tight">Rp0</b>
                <span className="text-sm text-muted-foreground">selamanya</span>
              </p>
              <p className="mt-3 text-[0.9rem] text-muted-foreground">Untuk mencoba cara belajar di Pyground.</p>
            </div>
            <ul className="grid gap-2.5 border-t pt-5 text-[0.92rem]">
              <CheckItem>Seluruh Tahap 1 (14 pelajaran)</CheckItem>
              <CheckItem>Playground dan kuis</CheckItem>
              <CheckItem>Progres dan streak tersimpan</CheckItem>
            </ul>
            <OutlinePill href="#top">Buat akun gratis</OutlinePill>
          </div>

          <div className="overflow-hidden rounded-[22px] border-2 border-highlight">
            <p className="bg-highlight py-1.5 text-center text-[0.75rem] font-semibold text-highlight-foreground">
              Paling lengkap
            </p>
            <div className="grid gap-6 bg-card p-7">
              <div>
                <h3 className="font-semibold text-highlight">Akses 30 hari</h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <b className="text-[2.6rem] leading-none font-semibold tracking-tight tabular-nums">
                    {rupiah(passPrice)}
                  </b>
                  <span className="text-sm text-muted-foreground">/ 30 hari</span>
                </p>
                <p className="mt-3 text-[0.9rem] text-muted-foreground">Semua tahap, semua proyek.</p>
              </div>
              <ul className="grid gap-2.5 border-t pt-5 text-[0.92rem]">
                <CheckItem>Semua 61 pelajaran dan pelajaran baru</CheckItem>
                <CheckItem>Semua proyek dan kuis</CheckItem>
                <CheckItem>Perpanjang lebih awal, sisa hari tidak hangus</CheckItem>
                <CheckItem>Pengingat email sebelum akses berakhir</CheckItem>
              </ul>
              <PillLink href="#top">Beli akses</PillLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- faq */

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionTitle tag="FAQ" label="Tanya jawab" title="Pertanyaan yang sering muncul" />
        <div className="border-t">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full border text-[1rem] leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[64ch] pb-5 leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- final cta */

export function FinalCta() {
  return (
    <section className="py-16">
      <Container>
        {/* Fixed colors: this panel looks the same in light and dark mode. */}
        <div className="grid overflow-hidden rounded-[28px] lg:grid-cols-2">
          <div className="grid content-center gap-6 bg-[#15172f] p-8 text-white sm:p-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 py-0.5 pr-3 pl-0.5 text-[0.68rem] font-semibold tracking-[0.06em] uppercase">
              <span className="rounded-full bg-[#ff7a6b] px-2 py-0.5 text-[#15172f]">Mulai</span>
              <span className="text-white/70">Hari ini</span>
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
              Siap menulis baris Python pertamamu?
            </h2>
            <p className="text-white/70">14 pelajaran pertama gratis. Daftar cukup dengan email.</p>
            <div className="flex flex-wrap gap-3">
              <PillLink href="#top" tone="light">
                Mulai gratis
              </PillLink>
              <a
                href="#kurikulum"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-5 text-[0.95rem] font-semibold hover:border-white/60"
              >
                Lihat kurikulum
              </a>
            </div>
          </div>

          <div
            className="relative grid min-h-[340px] content-center justify-items-center gap-4 p-8"
            style={{ background: "linear-gradient(160deg, #2f3380 0%, #6b4a9e 55%, #e0705f 100%)" }}
          >
            <div className="max-w-[320px] rounded-2xl bg-[#15172f] p-4 text-[0.9rem] text-white shadow-xl">
              <p className="flex items-center gap-2 font-mono text-[0.75rem] text-[#a0a3c6]">
                <Play className="size-3" aria-hidden /> main.py · 0,2 detik
              </p>
              <p className="mt-1.5 font-mono">Total Rp 59,500</p>
            </div>
            <div className="max-w-[320px] translate-x-6 rounded-2xl bg-white p-4 text-[0.9rem] text-[#1b1d3a] shadow-xl">
              <p className="flex items-center gap-2 font-semibold">
                <Check className="size-4 text-[#1f8a5b]" aria-hidden /> Kuis selesai
              </p>
              <p className="mt-1 text-[#5e6283]">3 dari 3 jawaban benar. Lanjut ke pelajaran berikutnya.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#15172f] px-4 py-2 text-[0.82rem] text-white shadow-xl">
              <Flame className="size-4 text-[#ff7a6b]" aria-hidden /> Streak 6 hari
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- footer */

const footerCols = [
  {
    title: "Belajar",
    links: [
      ["Kurikulum", "#kurikulum"],
      ["Harga", "#harga"],
      ["FAQ", "#faq"],
    ],
  },
  {
    title: "Akun",
    links: [
      ["Masuk", "#top"],
      ["Daftar gratis", "#top"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="pt-10 pb-12">
      <Container className="grid gap-10 border-t pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid content-start gap-2">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary font-mono text-[0.75rem] text-primary-foreground">
              py
            </span>
            {brand.name}
          </p>
          <p className="text-sm text-muted-foreground">{brand.tagline.id}</p>
          <p className="text-sm text-muted-foreground">Didukung oleh {brand.supportedBy}</p>
        </div>
        {footerCols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="grid content-start gap-2.5 text-sm">
            <p className="font-semibold">{c.title}</p>
            {c.links.map(([label, href]) => (
              <a key={label} href={href} className="w-fit text-muted-foreground hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
        ))}
      </Container>
    </footer>
  );
}
