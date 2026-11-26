import {
  Component,
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { clsx } from "clsx";
import {
  CODE_BLOCK_TITLE_CLASS,
  buildCodeLines,
  codeBlockMaxHeight,
  codeBlockStyles,
  codeBlockTheme,
  lineNumberDigits,
  type CodeBlockVariant,
  type CodeDiffKind,
  type CodeHighlighter,
  type CodeLineSpec,
} from "@ui-organized/core";
import { UioClipboard } from "../clipboard/clipboard.js";

export type { CodeBlockVariant, CodeHighlighter, CodeLineSpec };

interface RenderedLine {
  content: string;
  html: boolean;
  highlighted: boolean;
  diff: CodeDiffKind | null;
}

/**
 * Writes a highlighted line's HTML into its element. `[innerHTML]` would run
 * it through Angular's sanitizer, which strips the inline colours Shiki
 * writes; the renderer sets it as is, as React's `dangerouslySetInnerHTML`
 * does. Internal to CodeBlock.
 */
@Directive({
  selector: "[uioCodeBlockLineHtml]",
  standalone: true,
})
export class UioCodeBlockLineHtml {
  readonly html = input.required<string>({ alias: "uioCodeBlockLineHtml" });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const renderer = inject(Renderer2);
    effect(() => renderer.setProperty(host.nativeElement, "innerHTML", this.html()));
  }
}

/**
 * Code to read and copy: a header with a title, the language and a copy
 * button, over the code's lines.
 *
 * ```html
 * <div uioCodeBlock language="ts" title="main.ts" [code]="source" [highlight]="highlight"></div>
 * ```
 *
 * `highlight` turns the code into HTML (Shiki's `codeToHtml` works as is). Its
 * HTML is inserted as is, the way React's `dangerouslySetInnerHTML` inserts
 * it, because Angular's sanitizer would strip the inline colours Shiki
 * writes. Pass only a highlighter that escapes the code, as Shiki does.
 *
 * Nothing inside the template's `<pre>` may be reflowed: Angular keeps the
 * whitespace inside a `<pre>`, so it would render.
 */
@Component({
  selector: "div[uioCodeBlock]",
  standalone: true,
  imports: [UioClipboard, UioCodeBlockLineHtml],
  template: `
    @if (hasHeader()) {
      <div class="code-block__header">
        @if (title(); as text) {
          <span [class]="titleClass">{{ text }}</span>
        }
        @if (language(); as lang) {
          <span class="code-block__language">{{ lang }}</span>
        }
        @if (copyable()) {
          <div
            uioClipboard
            class="code-block__copy"
            variant="button"
            size="sm"
            [value]="code()"
            [copyLabel]="copyLabel()"
            [copiedLabel]="copiedLabel()"
          ></div>
        }
      </div>
    }
    <pre
      class="code-block__pre"
      tabindex="0"
      [style.max-height]="maxHeightCss() ?? null"
      [style.--code-block-digits]="digits()"
    ><code class="code-block__code">@for (line of rendered(); track $index) {@if (!$first) {<ng-container>{{ NEWLINE }}</ng-container>}@if (line.html) {<span class="code-block__line" [attr.data-highlighted]="line.highlighted ? '' : null" [attr.data-diff]="line.diff" [uioCodeBlockLineHtml]="line.content"></span>} @else {<span class="code-block__line" [attr.data-highlighted]="line.highlighted ? '' : null" [attr.data-diff]="line.diff">{{ line.content }}</span>}}</code></pre>
  `,
  host: {
    "[class]": "hostClass()",
    "[attr.data-language]": "language() ?? null",
    "[attr.data-theme]": "theme() ?? null",
    "[attr.title]": "null",
  },
})
export class UioCodeBlock {
  /** The code, exactly as it is copied. */
  readonly code = input<string>("");
  /** The language: passed to `highlight`, and shown in the header. */
  readonly language = input<string | undefined>(undefined);
  /** What the code is for, such as a file name. Bound as an input, so it never becomes a tooltip. */
  readonly title = input<string | undefined>(undefined);
  readonly highlight = input<CodeHighlighter | undefined>(undefined);
  readonly lineNumbers = input(false, { transform: booleanAttribute });
  /** Lines to mark: 1-based numbers, or a string such as "1,3-5". */
  readonly highlightLines = input<CodeLineSpec | undefined>(undefined);
  readonly wrap = input(false, { transform: booleanAttribute });
  /** Scroll the code past this height: a number of pixels, or any CSS length. */
  readonly maxHeight = input<number | string | undefined>(undefined);
  readonly variant = input<CodeBlockVariant>("default");
  readonly diff = input(false, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });
  readonly copyLabel = input("Copy");
  readonly copiedLabel = input("Copied");

  protected readonly NEWLINE = "\n";
  protected readonly titleClass = clsx("code-block__title", CODE_BLOCK_TITLE_CLASS);

  private readonly lines = computed(() =>
    buildCodeLines({
      code: this.code(),
      language: this.language(),
      highlight: this.highlight(),
      highlightLines: this.highlightLines(),
      diff: this.diff(),
    }),
  );
  protected readonly rendered = computed<RenderedLine[]>(() =>
    this.lines().map((line) => ({
      content: line.content,
      html: line.html,
      highlighted: line.highlighted,
      diff: line.diff ?? null,
    })),
  );
  protected readonly hasHeader = computed(
    () => this.title() != null || this.language() != null || this.copyable(),
  );
  protected readonly theme = computed(() => codeBlockTheme(this.variant()));
  protected readonly maxHeightCss = computed(() => codeBlockMaxHeight(this.maxHeight()));
  protected readonly digits = computed(() =>
    this.lineNumbers() ? String(lineNumberDigits(this.lines().length)) : null,
  );
  protected readonly hostClass = computed(() =>
    codeBlockStyles({
      variant: this.variant(),
      lineNumbers: this.lineNumbers(),
      wrap: this.wrap(),
      diff: this.diff(),
    }),
  );
}
