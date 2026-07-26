/**
 * Inline markdown for text authored as markdown elsewhere.
 *
 * Component descriptions come from Storybook's `docs.description.component` and
 * prop descriptions from `.types.ts` JSDoc — both written as markdown, because
 * both are rendered as markdown by Storybook. Dropping those strings into JSX
 * raw shows the user literal backticks: "Use `intent` to convey emphasis".
 *
 * Deliberately not a markdown library. These strings only ever use inline code,
 * bold and emphasis, and pulling in a parser (plus a sanitiser, since prop
 * descriptions come from source files) to render three constructs would be a bad
 * trade. Anything unrecognised falls through as plain text.
 */
import { Fragment, type ReactNode } from "react";

/** `code` first: emphasis markers inside a code span must stay literal. */
const TOKEN = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)/g;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text.slice(last, index));

    const [full, code, strong, em, underscoreEm] = match;
    if (code) out.push(<code key={key++}>{code.slice(1, -1)}</code>);
    else if (strong) out.push(<strong key={key++}>{strong.slice(2, -2)}</strong>);
    else if (em) out.push(<em key={key++}>{em.slice(1, -1)}</em>);
    else if (underscoreEm) out.push(<em key={key++}>{underscoreEm.slice(1, -1)}</em>);

    last = index + full.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function InlineMarkdown({ text }: { text: string | undefined }) {
  if (!text) return null;
  return <Fragment>{renderInline(text)}</Fragment>;
}
