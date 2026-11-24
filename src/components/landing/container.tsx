import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1120px] px-4 sm:px-6", className)} {...props} />;
}

export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-9 grid max-w-[640px] gap-2.5">
      <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">{eyebrow}</span>
      <h2 className="text-[clamp(1.7rem,3.4vw,2.3rem)] leading-tight font-extrabold tracking-tight">{title}</h2>
      {children && <p className="text-[1.05rem] text-muted-foreground">{children}</p>}
    </div>
  );
}
