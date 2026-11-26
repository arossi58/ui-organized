<!-- Code to read and copy. Nothing inside the <pre> may be reflowed, since its whitespace renders. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import {
  CODE_BLOCK_TITLE_CLASS,
  buildCodeLines,
  codeBlockMaxHeight,
  codeBlockStyles,
  codeBlockTheme,
  lineNumberDigits,
} from "@ui-organized/core";
import Clipboard from "../Clipboard/Clipboard.vue";
import type { CodeBlockProps } from "./CodeBlock.types.js";
import "@ui-organized/core/components/CodeBlock/CodeBlock.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<CodeBlockProps>(), {
  lineNumbers: false,
  wrap: false,
  variant: "default",
  diff: false,
  copyable: true,
  copyLabel: "Copy",
  copiedLabel: "Copied",
});
const attrs = useAttrs();

const lines = computed(() =>
  buildCodeLines({
    code: props.code,
    language: props.language,
    highlight: props.highlight,
    highlightLines: props.highlightLines,
    diff: props.diff,
  }),
);
const rootClass = computed(() =>
  clsx(
    codeBlockStyles({ variant: props.variant, lineNumbers: props.lineNumbers, wrap: props.wrap, diff: props.diff }),
    attrs.class as string | undefined,
  ),
);
const hasHeader = computed(() => props.title != null || props.language != null || props.copyable);
const preStyle = computed(() => ({
  maxHeight: codeBlockMaxHeight(props.maxHeight),
  ...(props.lineNumbers ? { "--code-block-digits": String(lineNumberDigits(lines.value.length)) } : {}),
}));
</script>

<template>
  <div
    :class="rootClass"
    :data-language="language"
    :data-theme="codeBlockTheme(variant)"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div v-if="hasHeader" class="code-block__header">
      <span v-if="title != null" :class="['code-block__title', CODE_BLOCK_TITLE_CLASS]">{{ title }}</span>
      <span v-if="language != null" class="code-block__language">{{ language }}</span>
      <Clipboard
        v-if="copyable"
        class="code-block__copy"
        variant="button"
        size="sm"
        :value="code"
        :copy-label="copyLabel"
        :copied-label="copiedLabel"
      />
    </div>
    <!-- Focusable, so a keyboard can scroll code wider or taller than the block. -->
    <pre class="code-block__pre" tabindex="0" :style="preStyle"><code class="code-block__code"><template v-for="(line, i) in lines" :key="i">{{ i > 0 ? "\n" : "" }}<span v-if="line.html" class="code-block__line" :data-highlighted="line.highlighted ? '' : undefined" :data-diff="line.diff" v-html="line.content"></span><span v-else class="code-block__line" :data-highlighted="line.highlighted ? '' : undefined" :data-diff="line.diff">{{ line.content }}</span></template></code></pre>
  </div>
</template>
