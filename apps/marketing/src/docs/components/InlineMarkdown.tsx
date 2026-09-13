/**
 * Inline markdown for text authored as markdown elsewhere.
 *
 * Component descriptions come from Storybook's `docs.description.component` and
 * prop descriptions from `.types.ts` JSDoc — both written as markdown, because
 * both are rendered as markdown by Storybook. Dropping those strings into JSX
 * raw shows the user literal backticks: "Use `intent` to convey emphasis".
 *
 * Deliberately not a markdown library. These strings only ever use inline code,
 * bold, emphasis and the occasional link, and pulling in a parser (plus a
 * sanitiser, since prop descriptions come from source files) to render four
 * constructs would be a bad trade. Anything unrecognised falls through as plain
 * text. `MarkdownBlocks` handles the block layer for changelog entries and
 * delegates back here, so there is still one inline implementation.
 */
import { Fragment, type ReactNode } from "react";

/**
 * `code` first: emphasis markers inside a code span must stay literal. Order
 * only breaks ties at the same offset — `matchAll` scans left to right — so a
 * link nested in bold still resolves bold-first, as it should.
 */
const TOKEN = /(`[^`]+`)|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)/g;

const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text.slice(last, index));

    const [full, code, link, strong, em, underscoreEm] = match;
    if (code) out.push(<code key={key++}>{code.slice(1, -1)}</code>);
    else if (link) {
      const [, label, href] = LINK.exec(link) ?? [];
      // Off-site links open away from the docs and can't leak the referrer.
      const external = /^https?:\/\//.test(href ?? "");
      out.push(
        <a key={key++} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {label}
        </a>,
      );
    }
    // Emphasis recurses so a code span inside bold still renders as code —
    // changelog entries use ``**`@ui-organized/react`**`` as a sub-heading, and
    // showing that reader literal backticks is the exact bug this file exists
    // to prevent. Code spans deliberately don't recurse: their contents are
    // literal by definition. Each step strips its own markers, so the string
    // shrinks and the recursion always terminates.
    else if (strong) out.push(<strong key={key++}>{renderInline(strong.slice(2, -2))}</strong>);
    else if (em) out.push(<em key={key++}>{renderInline(em.slice(1, -1))}</em>);
    else if (underscoreEm) {
      out.push(<em key={key++}>{renderInline(underscoreEm.slice(1, -1))}</em>);
    }

    last = index + full.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function InlineMarkdown({ text }: { text: string | undefined }) {
  if (!text) return null;
  return <Fragment>{renderInline(text)}</Fragment>;
}
