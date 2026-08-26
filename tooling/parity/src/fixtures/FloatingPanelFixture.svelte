<script lang="ts">
  import {
    FloatingPanel, FloatingPanelTrigger, FloatingPanelContent, FloatingPanelHeader,
    FloatingPanelTitle, FloatingPanelBody, FloatingPanelClose,
  } from "@ui-organized/svelte";

  /**
   * `triggerClass` is separate from `triggerProps` because the gate rewrites
   * `className` to `class` for this side only at the top level. A nested
   * `triggerProps.className` would arrive here unrenamed and be forwarded to the
   * DOM as an unknown attribute, so the dialect is spelled out per framework and
   * the value stays in the case.
   */
  let { triggerProps = {}, triggerClass, contentProps = {}, ...props }: Record<string, any> =
    $props();
</script>

<FloatingPanel {...props}>
  <FloatingPanelTrigger class={triggerClass} {...triggerProps}>Open</FloatingPanelTrigger>
  <FloatingPanelContent {...contentProps}>
    <FloatingPanelHeader>
      <FloatingPanelTitle>Title</FloatingPanelTitle>
      <FloatingPanelClose />
    </FloatingPanelHeader>
    <FloatingPanelBody>Body</FloatingPanelBody>
  </FloatingPanelContent>
</FloatingPanel>
