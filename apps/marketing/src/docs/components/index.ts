/**
 * The docs component kit.
 *
 * Every docs page composes from here — Introduction, both Foundations pages, and
 * the component Docs/Inspect views. Nothing on a page should reach past this
 * barrel for chrome, typography or preview behaviour; if a page needs something
 * the kit doesn't have, the kit is what should grow.
 */

export { DocsLayout } from "./DocsLayout";
export { DocsNav, DOCS_COMPACT_QUERY } from "./DocsNav";
export { DocsNavSheet } from "./DocsNavSheet";
export { DocsPageHeader, DocsTabs, type DocsTab } from "./DocsPageHeader";
export { DocsProse, DocsSection } from "./DocsProse";
export { InlineMarkdown, renderInline } from "./InlineMarkdown";
export { CodeBlock, CopyButton } from "./CodeBlock";
export { EcosystemDiagram } from "./EcosystemDiagram";
export { PreviewSurface } from "./PreviewSurface";
export { PrimaryExample, exampleCode, importStatementFor } from "./PrimaryExample";
export { StoryExample } from "./StoryExample";
export { PropsTable } from "./PropsTable";
export { StatusBadge } from "./StatusBadge";
export { useCopy, copyLabel, type CopyState } from "./useCopy";
