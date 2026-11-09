/**
 * Foundations → Typography — a port of
 * `apps/storybook/src/foundations/Typography.mdx`.
 *
 * `TypeStyleTable` is imported from Storybook's own foundations directory rather
 * than reimplemented, for the same reason as the color tables: it reads the
 * type scale from `@ui-organized/tokens`, so one module means the specimen here
 * and the specimen in Storybook can never disagree.
 */
import { TypeStyleTable } from "../../../../storybook/src/foundations/TypeStyleTable";
import { DocsPageHeader, DocsProse } from "../components";

export function FoundationsTypographyPage() {
  return (
    <>
      <DocsPageHeader
        title="Typography"
        lede={
          <>
            One source of truth for text: 40 global{" "}
            <code>.text-&#123;weight&#125;-&#123;step&#125;</code> utility classes that mirror
            the Figma type-style panel. Each bundles font family, size, weight and line-height
            from <code>--type-*</code> tokens.
          </>
        }
      />

      <DocsProse>
        <TypeStyleTable />
      </DocsProse>
    </>
  );
}
