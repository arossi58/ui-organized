<!-- Code to read and copy. React's CodeBlock renders the same markup; nothing inside the <pre> may be reflowed, since its whitespace renders. -->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    CODE_BLOCK_TITLE_CLASS,
    buildCodeLines,
    codeBlockMaxHeight,
    codeBlockStyles,
    codeBlockTheme,
    lineNumberDigits,
  } from "@ui-organized/core";
  import Clipboard from "../Clipboard/Clipboard.svelte";
  import type { CodeBlockProps } from "./CodeBlock.types.js";
  import "@ui-organized/core/components/CodeBlock/CodeBlock.css";

  let {
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
    class: className,
    ...rest
  }: CodeBlockProps = $props();

  const lines = $derived(buildCodeLines({ code, language, highlight, highlightLines, diff }));
  const hasHeader = $derived(title != null || language != null || copyable);
  const digits = $derived(lineNumbers ? String(lineNumberDigits(lines.length)) : undefined);
</script>

<div
  class={clsx(codeBlockStyles({ variant, lineNumbers, wrap, diff }), className)}
  data-language={language}
  data-theme={codeBlockTheme(variant)}
  {...rest}
>
  {#if hasHeader}
    <div class="code-block__header">
      {#if title != null}<span class={clsx("code-block__title", CODE_BLOCK_TITLE_CLASS)}>{title}</span>{/if}
      {#if language != null}<span class="code-block__language">{language}</span>{/if}
      {#if copyable}
        <Clipboard class="code-block__copy" variant="button" size="sm" value={code} {copyLabel} {copiedLabel} />
      {/if}
    </div>
  {/if}
  <!-- Focusable, so a keyboard can scroll code wider or taller than the block. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <pre class="code-block__pre" tabindex="0" style:max-height={codeBlockMaxHeight(maxHeight)} style:--code-block-digits={digits}><code class="code-block__code">{#each lines as line, i}{#if i > 0}{"\n"}{/if}{#if line.html}<span class="code-block__line" data-highlighted={line.highlighted ? "" : undefined} data-diff={line.diff}>{@html line.content}</span>{:else}<span class="code-block__line" data-highlighted={line.highlighted ? "" : undefined} data-diff={line.diff}>{line.content}</span>{/if}{/each}</code></pre>
</div>
