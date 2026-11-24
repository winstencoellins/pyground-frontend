import { useTranslations } from "next-intl";
import { PlaygroundView, type Tok } from "./playground-view";

const prices = [14000, 28000, 17500];

/** Builds the sample program in the page's language; identifiers and output follow the translation. */
export function PlaygroundDemo() {
  const t = useTranslations("Playground");
  const [list, item, price] = [t("items"), t("item"), t("price")];
  const names = [t("rice"), t("eggs"), t("sugar")];

  const code: Tok[][] = [
    [["c", t("comment")]],
    [["t", `${list} = {`]],
    ...names.map((n, i): Tok[] => [
      ["t", "    "],
      ["s", `"${n}"`],
      ["t", ": "],
      ["n", String(prices[i])],
      ["t", ","],
    ]),
    [["t", "}"]],
    [
      ["t", "total = "],
      ["n", "0"],
    ],
    [
      ["k", "for"],
      ["t", ` ${item}, ${price} `],
      ["k", "in"],
      ["t", ` ${list}.items():`],
    ],
    [
      ["t", "    "],
      ["f", "print"],
      ["t", "("],
      ["s", `f"{${item}:<6} Rp{${price}:>7,}"`],
      ["t", ")"],
    ],
    [["t", `    total += ${price}`]],
    [
      ["f", "print"],
      ["t", "("],
      ["s", 'f"Total  Rp{total:>7,}"'],
      ["t", ")"],
    ],
  ];

  // What Python prints for this program: `:<6` pads names, `:>7,` right-aligns with comma grouping.
  const fmt = (n: number) => n.toLocaleString("en-US").padStart(7);
  const output = [
    ...names.map((n, i) => `${n.padEnd(6)} Rp${fmt(prices[i]!)}`),
    `Total  Rp${fmt(prices.reduce((a, b) => a + b, 0))}`,
  ];

  return (
    <PlaygroundView
      code={code}
      output={output}
      labels={{ region: t("label"), lesson: t("lesson"), run: t("run"), output: t("output") }}
    />
  );
}
