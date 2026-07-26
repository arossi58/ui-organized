/**
 * Foundations → Typography — a port of
 * `apps/storybook/src/foundations/Typography.mdx`.
 *
 * `TypeStyleTable` is imported from Storybook's own foundations directory rather
 * than reimplemented, for the same reason as the colour tables: it reads the
 * type scale from `@ui-organized/tokens`, so one module means the specimen here
 * and the specimen in Storybook can never disagree.
 */
import { TypeStyleTable } from "../../../../storybook/src/foundations/TypeStyleTable";
import { DocsPageHeader, DocsProse, DocsSection } from "../components";

export function FoundationsTypographyPage() {
  return (
    <>
      {/* No eyebrow — see `FoundationsColorPage`. */}
      <DocsPageHeader
        title="Typography"
        lede={
          <>
            The design system ships a single source of truth for text: 40 global{" "}
            <code>.text-&#123;weight&#125;-&#123;step&#125;</code> utility classes that mirror
            the Figma type-style panel. Each class bundles font family, size, weight and
            line-height from <code>--type-*</code> tokens, so components apply one class
            instead of re-declaring those properties.
          </>
        }
      />

      <DocsProse>
        <p>
          Weights are <strong>default · emphasis · strong · heavy</strong>; steps run from{" "}
          <code>display-xlarge</code> down to <code>caption</code>. Display and heading steps
          use the heading font; body and caption steps use the body font.
        </p>

        <DocsSection title="Type styles">
          <TypeStyleTable />
        </DocsSection>
      </DocsProse>
    </>
  );
}
