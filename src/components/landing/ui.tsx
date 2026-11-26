import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** In-page anchors (#harga) stay plain links; paths go through the locale-aware Link. */
function Anchor({ href, ...props }: React.ComponentProps<"a"> & { href: string }) {
  return href.startsWith("#") ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}

/** Stagger position for the motion-* classes in globals.css. */
export const order = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)} {...props} />;
}

/** Two-part eyebrow chip: a small merah tag, then a label. */
export function Chip({ tag, children, className }: { tag: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border bg-card py-0.5 pr-3 pl-0.5 text-[0.68rem] font-semibold tracking-[0.06em] uppercase",
        className,
      )}
    >
      <span className="rounded-full bg-highlight px-2 py-0.5 text-highlight-foreground">{tag}</span>
      <span className="text-muted-foreground">{children}</span>
    </span>
  );
}

/** Pill CTA with a merah arrow circle. `tone="light"` is for dark panels. */
export function PillLink({
  href,
  children,
  tone = "ink",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "ink" | "light";
  className?: string;
}) {
  return (
    <Anchor
      href={href}
      className={cn(
        "group inline-flex h-12 w-fit items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 text-[0.95rem] font-semibold shadow-[0_12px_24px_-12px_rgb(0_0_0/0.35)] transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/50",
        tone === "ink" ? "bg-foreground text-background" : "bg-white text-ink",
        className,
      )}
    >
      {children}
      <span className="grid size-9 place-items-center rounded-full bg-highlight text-highlight-foreground transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </Anchor>
  );
}

export function OutlinePill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Anchor
      href={href}
      className="inline-flex h-11 w-fit items-center rounded-full border bg-card px-5 text-[0.92rem] font-semibold outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50"
    >
      {children}
    </Anchor>
  );
}

export function SectionTitle({
  tag,
  label,
  title,
  children,
  center,
}: {
  tag: string;
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "motion-reveal grid content-start gap-4",
        center ? "mx-auto max-w-[680px] justify-items-center text-center" : "max-w-[640px]",
      )}
    >
      <Chip tag={tag}>{label}</Chip>
      <h2 className="text-[clamp(2rem,4.2vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em]">{title}</h2>
      {children && <p className="text-[1.05rem] leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}
