import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { getMessages } from "next-intl/server";
import remarkGfm from "remark-gfm";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AnimatedDiagram, Callout, FileTree, Quiz, TerminalBlock, VideoEmbed } from "./blocks";
import { Playground, type PlaygroundLabels } from "./playground";

type Props<T extends keyof React.JSX.IntrinsicElements> = React.ComponentProps<T>;

// Lesson typography: the MDX elements mapped to the Pyground type scale.
const components = {
  h1: (p: Props<"h1">) => <h2 {...p} className="mt-10 mb-4 text-[1.9rem] font-semibold tracking-[-0.03em]" />,
  h2: (p: Props<"h2">) => <h2 {...p} className="mt-10 mb-3 text-[1.45rem] font-semibold tracking-[-0.02em]" />,
  h3: (p: Props<"h3">) => <h3 {...p} className="mt-8 mb-2 text-[1.15rem] font-semibold" />,
  p: (p: Props<"p">) => <p {...p} className="my-4 leading-[1.75]" />,
  ul: (p: Props<"ul">) => <ul {...p} className="my-4 list-disc space-y-1.5 pl-6 leading-[1.7]" />,
  ol: (p: Props<"ol">) => <ol {...p} className="my-4 list-decimal space-y-1.5 pl-6 leading-[1.7]" />,
  a: (p: Props<"a">) => <a {...p} className="font-semibold text-primary-text underline underline-offset-4" />,
  strong: (p: Props<"strong">) => <strong {...p} className="font-semibold" />,
  blockquote: (p: Props<"blockquote">) => <blockquote {...p} className="my-6 border-l-4 pl-4 text-muted-foreground" />,
  hr: () => <hr className="my-10" />,
  // Inline code; fenced blocks are styled through `pre` below.
  code: ({ className, ...p }: Props<"code">) => (
    <code
      {...p}
      className={cn(
        className ? className : "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.88em]",
        "[pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-[0.85rem]",
      )}
    />
  ),
  pre: (p: Props<"pre">) => (
    <pre {...p} className="my-6 overflow-x-auto rounded-2xl border bg-card px-4 py-3 font-mono leading-relaxed" />
  ),
  table: (p: Props<"table">) => (
    <div className="my-6 overflow-x-auto rounded-2xl border">
      <table {...p} className="w-full border-collapse text-left text-[0.92rem]" />
    </div>
  ),
  th: (p: Props<"th">) => <th {...p} className="border-b bg-muted px-4 py-2.5 font-semibold" />,
  td: (p: Props<"td">) => <td {...p} className="border-b px-4 py-2.5 align-top" />,
  Callout,
  TerminalBlock,
  FileTree,
  Quiz,
  AnimatedDiagram,
  VideoEmbed,
};

/**
 * Compiles a lesson's MDX on the server. The source is our own /content served by pyground-api, so running
 * its expressions is trusted (it is code we review in the backend repo, never user input).
 */
export async function LessonContent({ source, locale }: { source: string; locale: Locale }) {
  // Every lesson opens with "# <title>"; the page header already shows the title, so drop that first line.
  const body = source.replace(/^\s*# [^\n]*\n/, "");
  const [{ default: Content }, messages] = await Promise.all([
    evaluate(body, { ...runtime, remarkPlugins: [remarkGfm] }),
    getMessages({ locale }),
  ]);
  // The UI follows the site locale even when the lesson text falls back to Indonesian.
  const labels: PlaygroundLabels = messages.Runner;
  return (
    <div className="text-[1.02rem] [overflow-wrap:anywhere] [&>*:first-child]:mt-0">
      <Content
        components={{
          ...components,
          Playground: (p: { initialCode: string; expectError?: boolean }) => <Playground {...p} labels={labels} />,
        }}
      />
    </div>
  );
}
