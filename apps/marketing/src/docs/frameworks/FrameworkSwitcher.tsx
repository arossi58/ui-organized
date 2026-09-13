/**
 * The framework picker, and the two notes that keep it honest.
 *
 * The picker is the design system's own `SegmentedControl` — the same dogfooding
 * rule the Docs/Inspect strip follows by using `Tabs`.
 *
 * Neither note is decoration. The previews on these pages are React components
 * rendered live, in every framework: the docs site is a React app and there is
 * no per-framework Storybook to embed. A reader on the Vue tab watching a real
 * component respond to real interaction will assume it is Vue unless told, so it
 * says so once, next to the control that caused it.
 */
import {
  DOC_FRAMEWORKS,
  FRAMEWORK_INFO,
  isDocFramework,
} from "@ui-organized/code-connect/browser";
import { SegmentedControl } from "@ui-organized/react";
import type { DocsComponent } from "../registry";
import { useDocsFramework } from "./FrameworkContext";
import type { FrameworkGap } from "./sample";
import styles from "./frameworks.module.css";

export function FrameworkSwitcher() {
  const { framework, setFramework } = useDocsFramework();

  return (
    <div className={styles.switcher}>
      <SegmentedControl
        size="sm"
        aria-label="Code sample framework"
        value={framework}
        onValueChange={(value) => {
          if (isDocFramework(value)) setFramework(value);
        }}
        items={DOC_FRAMEWORKS.map((id) => ({ value: id, label: FRAMEWORK_INFO[id].label }))}
      />
      {framework !== "react" && (
        <p className={styles.previewNote}>
          Previews are the React components, rendered live. Only the code samples switch.
        </p>
      )}
    </div>
  );
}

/**
 * Shown in place of a snippet, and it always names the actual reason — never a
 * React sample under another framework's name, which a reader has no way to tell
 * is wrong.
 */
export function FrameworkGapNote({
  component,
  gap,
}: {
  component: DocsComponent;
  gap: FrameworkGap;
}) {
  return (
    <div className={styles.gap} role="note">
      {gap.reason === "missing-component" ? (
        <>
          <p className={styles.gapTitle}>
            No {gap.label} version of {component.name} yet.
          </p>
          <p className={styles.gapBody}>
            <code>{gap.packageName}</code> covers {gap.covered} of the {gap.total} documented
            components, and {component.name} is not one of them. Switch back to React for a
            sample you can copy.
          </p>
        </>
      ) : (
        <>
          <p className={styles.gapTitle}>
            This example needs props {gap.label} hasn&rsquo;t got.
          </p>
          <p className={styles.gapBody}>
            <code>{gap.symbol}</code> in <code>{gap.packageName}</code> has no{" "}
            {gap.props.map((prop, i) => (
              <span key={prop}>
                {i > 0 && ", "}
                <code>{prop}</code>
              </span>
            ))}
            . A sample without {gap.props.length > 1 ? "them" : "it"} would be a different
            example, so there isn&rsquo;t one. The other examples on this page still switch.
          </p>
        </>
      )}
    </div>
  );
}
