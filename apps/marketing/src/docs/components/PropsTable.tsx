/**
 * The component's own API, straight from the Code Connect manifest.
 *
 * Values come from `expandPropType` — the same function that expands unions for
 * the AI context block — so what a human reads here and what an agent is told
 * can't drift apart.
 */
import { expandPropType, type PropDefinition } from "@ui-organized/code-connect/browser";
import { PASSTHROUGH_NOTE } from "@ui-organized/code-connect/browser";
import { InlineMarkdown } from "./InlineMarkdown";
import styles from "./content.module.css";

interface PropsTableProps {
  props: PropDefinition[];
  /** Named-alias expansions, e.g. `{ CanonicalIconName: [...] }`. */
  typeValues?: Record<string, string[]>;
  /** Show the "everything else forwards to the element" note. */
  showPassthrough?: boolean;
}

export function PropsTable({ props, typeValues, showPassthrough = true }: PropsTableProps) {
  if (props.length === 0) {
    return (
      <>
        <div className={styles.tableWrap}>
          <p className={styles.noProps}>
            This component declares no props of its own — it's driven by its children and
            the standard attributes of its underlying element.
          </p>
        </div>
        {showPassthrough && <p className={styles.passthrough}>{PASSTHROUGH_NOTE}</p>}
      </>
    );
  }

  return (
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
}
