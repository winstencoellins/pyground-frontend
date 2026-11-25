import { AlertTriangle, Info, Lightbulb, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

/* Lesson components from content/README.md. Quiz, AnimatedDiagram and VideoEmbed are
   simple read-only versions here; #15 and #16 replace them with the interactive ones. */

const calloutStyle = {
  tip: { icon: Lightbulb, className: "border-primary/25 bg-primary/5", iconClass: "text-primary-text" },
  info: { icon: Info, className: "bg-muted", iconClass: "text-primary-text" },
  warning: { icon: AlertTriangle, className: "border-highlight/30 bg-highlight/5", iconClass: "text-highlight" },
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
    <div className="my-6 overflow-hidden rounded-2xl bg-[#15172f] font-mono text-[0.85rem] text-[#d9dbf5]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 font-sans text-[0.72rem] font-semibold tracking-[0.08em] text-[#a0a3c6] uppercase">
        <Terminal className="size-3.5" aria-hidden /> Terminal
      </div>
      <pre className="overflow-x-auto px-4 py-3 leading-relaxed">
        <span className="text-[#ff7a6b] select-none">$ </span>
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

type Question = { question: string; options: string[]; answer: number; explanation?: string };

/** Static list until the interactive quiz (#15); answers are not shown. */
export function Quiz({ questions }: { questions: Question[] }) {
  return (
    <ol className="my-6 grid list-none gap-4 p-0">
      {questions.map((q, i) => (
        <li key={i} data-quiz-question className="rounded-2xl border bg-card p-4">
          <p className="my-0 font-semibold">
            {i + 1}. {q.question}
          </p>
          <ul className="mt-3 mb-0 grid list-none gap-2 p-0">
            {q.options.map((o, j) => (
              <li key={j} className="rounded-xl border px-3 py-2 text-[0.92rem]">
                {o}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/** Caption-only placeholder until the animated diagrams (#16). */
export function AnimatedDiagram({ caption }: { name: string; caption?: string }) {
  if (!caption) return null;
  return (
    <figure className="my-6 rounded-2xl border bg-muted px-4 py-6 text-center">
      <figcaption className="text-[0.9rem] text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

/** Videos still have placeholder IDs in the content; render nothing until real ones exist (#16). */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  if (!url.startsWith("https://www.youtube.com/embed/") || url.includes("VIDEO_ID")) return null;
  return (
    <div className="my-6 aspect-video overflow-hidden rounded-2xl border">
      <iframe
        src={url.replace("www.youtube.com", "www.youtube-nocookie.com")}
        title={title}
        className="size-full"
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
