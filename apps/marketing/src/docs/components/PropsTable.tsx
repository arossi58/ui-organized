/**
 * The component's own API, straight from the Code Connect manifest.
 *
 * Values come from `expandPropType` — the same function that expands unions for
 * the AI context block — so what a human reads here and what an agent is told
 * can't drift apart.
 *
 * On a phone the four columns scroll sideways and a long API pushes everything
 * after it far out of reach, so the table folds behind a disclosure and starts
 * closed — see `PROPS_COLLAPSE_QUERY`.
 */
import { useId, useState } from "react";
import { expandPropType, type PropDefinition } from "@ui-organized/code-connect/browser";
import { PASSTHROUGH_NOTE } from "@ui-organized/code-connect/browser";
import { Icon } from "@ui-organized/react";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { InlineMarkdown } from "./InlineMarkdown";
import styles from "./content.module.css";

/**
 * Where the table stops being readable in place and becomes a disclosure.
 *
 * The phone breakpoint the rest of the docs shell uses (docs.css) rather than
 * the rail's 900px: at 720px the frame has already given up its chrome and the
 * prop table is the widest thing left on the page.
 */
const PROPS_COLLAPSE_QUERY = "(max-width: 720px)";

interface PropsTableProps {
  props: PropDefinition[];
  /** Named-alias expansions, e.g. `{ CanonicalIconName: [...] }`. */
  typeValues?: Record<string, string[]>;
  /** Show the "everything else forwards to the element" note. */
  showPassthrough?: boolean;
}

export function PropsTable({ props, typeValues, showPassthrough = true }: PropsTableProps) {
  const collapsible = useMediaQuery(PROPS_COLLAPSE_QUERY);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const body =
    props.length === 0 ? (
      <>
        <div className={styles.tableWrap}>
          <p className={styles.noProps}>
            This component declares no props of its own — it's driven by its children and
            the standard attributes of its underlying element.
          </p>
        </div>
        {showPassthrough && <p className={styles.passthrough}>{PASSTHROUGH_NOTE}</p>}
      </>
    ) : (
      <>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Allowed values</th>
                <th scope="col">Default</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {props.map((prop) => {
                const { values } = expandPropType(prop, typeValues);
                return (
                  <tr key={prop.name}>
                    <td>
                      <span className={styles.propName}>{prop.name}</span>
                      {prop.required && (
                        <abbr className={styles.required} title="Required">
                          *
                        </abbr>
                      )}
                    </td>
                    <td>
                      {values ? (
                        <span className={styles.values}>
                          {values.map((value) => (
                            <code className={styles.value} key={value}>
                              "{value}"
                            </code>
                          ))}
                        </span>
                      ) : (
                        <span className={styles.typeText}>{prop.type}</span>
                      )}
                    </td>
                    <td>
                      {prop.defaultValue ? (
                        <code className={styles.value}>
                          {values?.includes(prop.defaultValue)
                            ? `"${prop.defaultValue}"`
                            : prop.defaultValue}
                        </code>
                      ) : (
                        <span className={styles.typeText}>—</span>
                      )}
                    </td>
                    <td className={styles.propNote}>
                      <InlineMarkdown text={prop.description} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showPassthrough && <p className={styles.passthrough}>{PASSTHROUGH_NOTE}</p>}
      </>
    );

  if (!collapsible) return body;

  return (
    <div className={styles.propsDisclosure} data-open={open}>
      <button
        type="button"
        className={styles.propsToggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span>{propsCountLabel(props.length)}</span>
        <Icon name={ChevronDown} size={16} className={styles.propsChevron} />
      </button>
      {/* Kept mounted so `aria-controls` always resolves, and so an expanded
          table doesn't lose its horizontal scroll position on re-render. */}
      <div id={panelId} hidden={!open}>
        {body}
      </div>
    </div>
  );
}

function propsCountLabel(count: number): string {
  if (count === 0) return "No props";
  return count === 1 ? "1 prop" : `${count} props`;
}
