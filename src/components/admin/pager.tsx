import { Link } from "@/i18n/navigation";

/** Search form + previous / next links; keeps the other query params. */
export function SearchForm({
  q,
  placeholder,
  button,
  children,
}: {
  q?: string;
  placeholder: string;
  button: string;
  children?: React.ReactNode;
}) {
  return (
    <form className="flex flex-wrap gap-2" role="search">
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 min-w-0 flex-1 rounded-xl border bg-card px-3 text-[16px] outline-none focus-visible:ring-4 focus-visible:ring-ring/50 sm:max-w-sm sm:text-[0.9rem]"
      />
      {children}
      <button type="submit" className="h-10 rounded-xl bg-foreground px-4 text-[0.88rem] font-semibold text-background">
        {button}
      </button>
    </form>
  );
}

export function Pager({
  page,
  limit,
  total,
  href,
  labels,
}: {
  page: number;
  limit: number;
  total: number;
  href: (page: number) => string;
  labels: { prev: string; next: string; summary: string };
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const link = "rounded-full border bg-card px-4 py-1.5 hover:border-foreground/40";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[0.85rem]">
      <span className="text-muted-foreground">
        {labels.summary
          .replace("{page}", String(page))
          .replace("{pages}", String(pages))
          .replace("{total}", String(total))}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className={link}>
            {labels.prev}
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className={link}>
            {labels.next}
          </Link>
        )}
      </div>
    </div>
  );
}

export const qs = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );
  return s.size ? `?${s}` : "";
};
