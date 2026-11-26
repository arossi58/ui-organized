import { Fragment, useMemo, type CSSProperties } from "react";
import { clsx } from "clsx";
import {
  CODE_BLOCK_TITLE_CLASS,
  buildCodeLines,
  codeBlockMaxHeight,
  codeBlockStyles,
  codeBlockTheme,
  lineNumberDigits,
} from "@ui-organized/core";
import { Clipboard } from "../Clipboard/index.js";
import type { CodeBlockProps } from "./CodeBlock.types.js";
import "@ui-organized/core/components/CodeBlock/CodeBlock.css";

/**
 * Code to read and copy: a header with a title, the language and a copy
 * button, over the code's lines. Highlighting is the caller's, through
 * `highlight`.
 */
export function CodeBlock({
  code,
  language,
  title,
  highlight,
  lineNumbers = false,
  highlightLines,
  wrap = false,
  maxHeight,
  variant = "default",
  diff = false,
  copyable = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
  ...props
}: CodeBlockProps) {
  const lines = useMemo(
    () => buildCodeLines({ code, language, highlight, highlightLines, diff }),
    [code, language, highlight, highlightLines, diff],
  );
  const hasHeader = title != null || language != null || copyable;
  const preStyle = {
    maxHeight: codeBlockMaxHeight(maxHeight),
    ...(lineNumbers ? { "--code-block-digits": lineNumberDigits(lines.length) } : {}),
  } as CSSProperties;

  return (
    <div
      className={clsx(codeBlockStyles({ variant, lineNumbers, wrap, diff }), className)}
      data-language={language}
      data-theme={codeBlockTheme(variant)}
      {...props}
    >
      {hasHeader && (
        <div className="code-block__header">
          {title != null && (
            <span className={clsx("code-block__title", CODE_BLOCK_TITLE_CLASS)}>{title}</span>
          )}
          {language != null && <span className="code-block__language">{language}</span>}
          {copyable && (
            <Clipboard
              className="code-block__copy"
              variant="button"
              size="sm"
              value={code}
              copyLabel={copyLabel}
              copiedLabel={copiedLabel}
            />
          )}
        </div>
      )}
      {/* Focusable, so a keyboard can scroll code wider or taller than the block
          (axe's scrollable-region-focusable). Shiki's own <pre> does the same. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre className="code-block__pre" tabIndex={0} style={preStyle}>
        <code className="code-block__code">
          {lines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && "\n"}
              {line.html ? (
                <span
                  className="code-block__line"
                  data-highlighted={line.highlighted ? "" : undefined}
                  data-diff={line.diff}
                  dangerouslySetInnerHTML={{ __html: line.content }}
                />
              ) : (
                <span
                  className="code-block__line"
                  data-highlighted={line.highlighted ? "" : undefined}
                  data-diff={line.diff}
                >
                  {line.content}
                </span>
              )}
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
}
