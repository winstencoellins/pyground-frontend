import { AlertTriangle, Info, Lightbulb, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

/* Small lesson components from content/README.md (Playground, Quiz and AnimatedDiagram have their own files). */

const calloutStyle = {
  tip: { icon: Lightbulb, className: "border-primary/25 bg-primary/5", iconClass: "text-primary-text" },
  info: { icon: Info, className: "bg-muted", iconClass: "text-primary-text" },
  warning: { icon: AlertTriangle, className: "border-warning/30 bg-warning/5", iconClass: "text-warning" },
} as const;

export function Callout({ type = "info", children }: { type?: keyof typeof calloutStyle; children: React.ReactNode }) {
  const s = calloutStyle[type] ?? calloutStyle.info;
  return (
    <aside className={cn("my-6 flex gap-3 rounded-2xl border px-4 py-3.5", s.className)}>
      <s.icon className={cn("mt-0.5 size-5 shrink-0", s.iconClass)} aria-hidden />
      <div className="min-w-0 [&>p]:my-0 [&>p+p]:mt-2">{children}</div>
    </aside>
  );
}

export function TerminalBlock({ command, output }: { command: string; output?: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl bg-ink font-mono text-[0.85rem] text-ink-foreground">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 font-sans text-[0.72rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
        <Terminal className="size-3.5" aria-hidden /> Terminal
      </div>
      <pre className="overflow-x-auto px-4 py-3 leading-relaxed">
        <span className="text-ink-accent select-none">$ </span>
        {command}
        {output ? `\n${output}` : ""}
      </pre>
    </div>
  );
}

export function FileTree({ children }: { children: React.ReactNode }) {
  return (
    <pre className="my-6 overflow-x-auto rounded-2xl border bg-muted px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
      {children}
    </pre>
  );
}
