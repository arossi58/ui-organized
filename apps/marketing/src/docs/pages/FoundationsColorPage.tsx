/**
 * Foundations → Color — a port of `apps/storybook/src/foundations/Color.mdx`.
 *
 * The prose is ported; the two tables and the tab strip are the *same modules*
 * Storybook renders (`CoreColorTable`, `SemanticTokenTable`, `Tabs`), imported
 * straight from `apps/storybook/src/foundations/`. They only depend on `react`,
 * `@ui-organized/react`, `@ui-organized/utils` and `@ui-organized/tokens`, all
 * of which this app already has — so the swatches here and the swatches in
 * Storybook are guaranteed identical, and neither can drift when the palette
 * changes.
 */
import { CoreColorTable } from "../../../../storybook/src/foundations/CoreColorTable";
import { SemanticTokenTable } from "../../../../storybook/src/foundations/SemanticTokenTable";
import { Tab, Tabs } from "../../../../storybook/src/foundations/Tabs";
import { DocsPageHeader, DocsProse, DocsSection } from "../components";

export function FoundationsColorPage() {
  return (
    <>
      {/* No eyebrow: the rail already files these pages under Foundations, so
          the label only repeated the group heading a few pixels to its left. */}
      <DocsPageHeader
        title="Color"
        lede={
          <>
            Colour has two layers: a <strong>core palette</strong> of ready-made OKLCH ramps,
            and the <strong>semantic tokens</strong> that map a small set of roles onto it per
            theme. Components speak only in roles; the palette is what those roles, and your
            custom themes, are built from.
          </>
        }
      />

      <DocsProse>
        <DocsSection
          title="Palette"
          subtitle="Core ramps on one tab, the roles that consume them on the other."
        >
          <Tabs>
            <Tab label="Core colors">
              <CoreColorTable />
            </Tab>
            <Tab label="Semantic tokens">
              <SemanticTokenTable />
            </Tab>
          </Tabs>
        </DocsSection>
      </DocsProse>
    </>
  );
}
